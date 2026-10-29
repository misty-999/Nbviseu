# NB Club Viseu — website

Site em HTML, CSS e JavaScript puro (sem build). Abre o `index.html` ou, melhor, serve a pasta com um servidor local para o `events.json` carregar:

```
npx serve .
```
(ou a extensão Live Server do VS Code)

## Ficheiros

| Ficheiro | Função |
|---|---|
| `index.html` | Página inicial (hero, eventos, galeria, sobre, social, contactos, footer) |
| `evento.html` + `evento.js` | Página individual de cada evento (`evento.html?id=...`) |
| `admin.html` + `admin.js` | Painel para adicionar, editar, publicar e remover eventos |
| `store.js` | **Configuração e dados**: contactos, redes, álbuns, fotografias, eventos de demonstração |
| `events.json` | Lista de eventos publicada no site |
| `common.js` | Navbar, menu mobile, animações, cursor, transições, scroll progress |
| `home.js` | Lógica da página inicial (próxima noite + contagem decrescente, eventos, galeria bento, lightbox) |
| `styles.css` | Estilos partilhados (navbar, rodapé, páginas de evento e admin) |
| `home.css` | Estilos da página inicial |

## Media (pasta `media/`)

A pasta já traz **imagens de exemplo** (geradas, não são fotografias do NB) para mostrares o layout completo. Substitui-as pelas reais mantendo os mesmos nomes. As únicas imagens reais são o cartaz do Funkween (recortado do 2Ticket).

Ficheiros em falta aparecem como espaços reservados elegantes.

- `media/hero.mp4` — vídeo da discoteca (desktop, 1080p, sem som, ~10 a 20 s, idealmente < 8 MB)
- `media/hero-mobile.mp4` — versão leve para telemóvel (720p ou menos)
- `media/hero.jpg` — fotografia do hero (também é o fallback do vídeo)
- `media/manifesto-2.jpg` — segunda fotografia da secção Sobre
- `media/poster-exemplo-*` — cartazes de demonstração (substitui-os quando criares os eventos reais)
- `media/manifesto.jpg` — fotografia da pista ou da cabine de DJ
- `media/galeria-01.jpg` ... `galeria-09.jpg` — galeria (edita a lista `PHOTOS` e os álbuns `ALBUMS` em `store.js`)
- Posters dos eventos: `media/poster-xxx.jpg` (indica o caminho no painel) ou carrega a imagem diretamente no painel

Usa apenas fotografias e vídeos do NB (ou com autorização). Comprime-os (WebP/JPG, máx. ~1800 px de largura).

## Dados reais

Edita o bloco `CONFIG` em `store.js`:
`phone`, `email`, `hours`, `facebook`, e `instagramPosts` (códigos das publicações, ex.: `instagram.com/p/ABC123/` → `'ABC123'`).
Campos vazios mostram texto neutro; **nenhuma morada, telefone ou horário foi inventado**. O link "Google Maps" faz uma pesquisa por "NB Club Viseu"; se tiveres o link exato do local, coloca-o em `mapsUrl`.

Quando tiveres conteúdo real, põe `showDemoNotes: false`.

## Gerir eventos

1. Abre `admin.html` (primeiro acesso: cria a palavra-passe).
2. Adiciona/edita/publica/remove eventos.
3. Clica **Exportar events.json** e substitui o ficheiro `events.json` no alojamento.

Importante: este painel guarda no navegador e a palavra-passe é só local. Serve para gerir e preparar o `events.json`, **não é segurança real**. Para vários administradores e publicação direta, o passo seguinte é ligar a um backend/CMS (Sanity, Strapi, Supabase, Firebase...) com autenticação a sério, trocando `loadEvents()` e `saveEvents()` em `store.js`.

## Bilhetes

Cada evento tem dois campos no painel: **Bilhetes em pré-venda** (ex.: 2Ticket) e **Bilheteira no dia do evento** (ex.: Ticketline, opcional). Na página do evento, no próprio dia o botão da bilheteira passa a principal. A plataforma habitual pode ser definida em `store.js` (`ticketing.doorUrl`). Como muda de evento para evento, o aviso é genérico.

## SEO

- Preenche o domínio em `<link rel="canonical">` e `og:image` no `index.html`.
- Já inclui dados estruturados `NightClub` (sem morada de rua, que deves acrescentar quando a confirmares) e `Event` nos eventos reais com data.
- Cria `sitemap.xml` e `robots.txt` quando tiveres o domínio.

## Publicar

Qualquer alojamento estático serve: Netlify, Vercel, Cloudflare Pages, GitHub Pages. Arrasta a pasta.

## Acessibilidade e performance

Navegação por teclado, link "saltar para o conteúdo", foco visível, `prefers-reduced-motion` respeitado, imagens com lazy loading, vídeo desativado com poupança de dados, cursor personalizado só em desktop com rato.
