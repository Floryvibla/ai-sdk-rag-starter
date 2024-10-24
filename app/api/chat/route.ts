import { createResource } from '@/lib/actions/resources';
import { findRelevantContent } from '@/lib/ai/embedding';
import { geminiPro } from '@/lib/model';
import { convertToCoreMessages, streamText, tool } from 'ai';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: geminiPro,
    messages: convertToCoreMessages(messages),
    system: `Você é um assistente útil. Sempre Verifique sua base de conhecimento(getInformation) antes de responder a quaisquer perguntas. Chame a ferramenta de consultar informação antes de responder qualquer pergunta do usuario. Responda apenas a perguntas usando informações de chamadas de ferramentas. se nenhuma informação relevante for encontrada nas chamadas de ferramentas, responda, "Desculpe, não sei."`,
    tools: {
      addResource: tool({
        description: `adicione um recurso à sua base de conhecimento. Se o usuário fornecer um pedaço aleatório de conhecimento sem ser solicitado, use esta ferramenta sem pedir confirmação.`,
        parameters: z.object({
          content: z.string().describe('o conteúdo ou recurso a ser adicionado à base de conhecimento') 
        }),
        execute: async ({ content }) => {
          const resources = await createResource({ content })
          return {resources};
        }
      }),
      getInformation: tool({
        description: `obtenha informações da sua base de conhecimento para responder perguntas.`,
        parameters: z.object({
          question: z.string().describe('a pergunta dos usuários melhorado pra buscar informação'),
        }),
        execute: async ({ question }) => {
          const relevantContentFind = await findRelevantContent(question)

          return { relevantContentFind }
        }
      }),
    }
  });

  return result.toDataStreamResponse();
}