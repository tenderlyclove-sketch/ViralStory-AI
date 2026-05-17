import { type ActionFunctionArgs } from '@remix-run/cloudflare';

export async function loader() {
  return new Response('Method Not Allowed', { status: 405 });
}

function formatFileTree(files: Record<string, string>): string {
  let output = '';
  for (const [path, content] of Object.entries(files)) {
    output += `File: ${path}\n\`\`\`\n${content}\n\`\`\`\n\n`;
  }
  return output;
}

export async function action({ request, context }: ActionFunctionArgs) {
  // Resolve API key
  let apiKey = context.cloudflare.env.OPENAI_API_KEY;
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map((c) => c.split('=').map(decodeURIComponent))
    );
    if (cookies.openai_api_key) {
      apiKey = cookies.openai_api_key;
    }
  }

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not configured' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json<{ task: string; files: Record<string, string>; model?: string }>();
    const { task, files, model = 'codex-mini-latest' } = body;

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: 'system',
            content: `You are an expert software engineer working inside a WebContainer browser environment.
You will receive a task and the current file tree. Respond ONLY with file changes needed to complete the task.
For each file you want to create or modify, output it in this exact format:

<boltArtifact id="codex-result" title="Codex changes">
<boltAction type="file" filePath="path/to/file.ext">
[full file content here]
</boltAction>
</boltArtifact>

Rules:
- Always output complete file contents, never partial diffs
- Only include files that need to change
- Do not explain or add commentary outside the artifact tags
- Paths are relative to the project root`,
          },
          {
            role: 'user',
            content: `Task: ${task}\n\nCurrent files:\n${formatFileTree(files)}`,
          },
        ],
        max_output_tokens: 16000,
        reasoning: { effort: 'medium' },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return new Response(errorData, {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // The stream is returned from OpenAI Responses API. However, the responses API is not inherently streaming
    // in the exact same format. The prompt says: "The Responses API response format contains an output array of content blocks. Extract text content blocks and stream them. The text output will contain the <boltArtifact> XML"
    // Wait, the prompt says "Stream the response back to the client using a ReadableStream (TransformStream pattern — same as how api.chat.ts does it)"
    // If we call fetch without stream: true, we get a complete JSON object.
    // Let me check what the prompt says about this: "The Responses API response format contains a output array of content blocks. Extract text content blocks and stream them."
    // Let's do a mock stream of the extracted text so it acts like a stream.
    
    const data = (await response.json()) as any;
    const outputBlocks = data.output || [];
    let fullText = '';
    for (const block of outputBlocks) {
      if (block.type === 'text') {
        fullText += block.text;
      }
    }

    // Create a stream to send the text back, simulating streaming if necessary, or just stream the whole chunk.
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    
    // Send it in chunks just to fulfill the streaming parser expectations, or send it all at once since we already awaited it.
    // The parser handles arbitrary chunks.
    writer.write(new TextEncoder().encode(fullText));
    writer.close();

    return new Response(readable, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
