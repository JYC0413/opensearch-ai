import { BingResults } from '@/app/types';
import { createOpenAI } from '@ai-sdk/openai';
import { CoreMessage, streamText } from 'ai';

export const runtime = 'edge';

export const POST = async (request: Request): Promise<Response> => {
  const body = (await request.json()) as { data: BingResults; input: string };

  if (!body.data || !body.input) {
    return new Response('Invalid request', { status: 400 });
  }

  const openai = createOpenAI({
    baseURL:process.env.LLAMAEDGE_BASE_URL
  });

  const messages: CoreMessage[] = [
    {
      role: 'system',
      content: `You are a search assistant that answers the user query based on search results. Give answers in markdown format. the search results are ${body.data.web.results
        .map(
          (result) =>
            `${result.title}\n\n${result.description}\n\n${result.url}\n\n`
        )
        .join(' ')}`,
    },
    {
      role: 'user',
      content: body.input ?? 'No question',
    },
  ];

  const stream = await streamText({
    model: openai(process.env.LLAMAEDGE_MODEL_NAME),
    messages: messages,
  });

  return stream.toDataStreamResponse();
};
