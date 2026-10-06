// Prévia local: roda o app de verdade contra um banco falso em memória,
// já "logado". Serve para conferir as telas logadas sem a senha do Guga.
// Só existe em `npm run dev` (http://localhost:5173/mast/dev/preview.html);
// o build publica apenas o index.html.
import { installMockBackend } from './mockBackend'

installMockBackend()
// Import dinâmico: o cliente Supabase precisa nascer depois do mock.
await import('../src/main')
