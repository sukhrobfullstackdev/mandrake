export const dynamic = 'force-dynamic';

export function GET() {
  return new Response(JSON.stringify({}), {
    status: 200,
  });
}
