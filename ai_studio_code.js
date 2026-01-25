class Router {
    constructor(routes) {
        this.routes = routes;
        this.app = document.getElementById('app');
        
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('load', () => this.handleRoute());
    }

    handleRoute() {
        const hash = window.location.hash || '#/';
        
        for (let path in this.routes) {
            // Cria Regex: Se a chave já tiver regex (ex: ([0-9]+)), mantém. 
            // Se tiver :param, substitui.
            const regexPath = new RegExp('^' + path.replace(/:[^\s/]+/g, '([\\w-]+)') + '$');
            const match = hash.match(regexPath);

            if (match) {
                const params = match.slice(1);
                this.routes[path](params);
                return;
            }
        }
        
        this.app.innerHTML = "<h1>404 - Página não encontrada</h1><a href='#/'>Voltar</a>";
    }
}

// 1. MODEL
class MediaModel {
    constructor() {
        this.medias = [
            { id: 'EhwXaUMzM8M', category: 'musica', title: 'Clipe Musical (Coldplay)' },
            { id: 'dQw4w9WgXcQ', category: 'educacao', title: 'Aula de JS (Rick Roll - Teste)' },
            { id: 'U3WbIh-vmYM', category: 'educacao', title: 'Hortolândia faz 34 anos!' }
        ];
    }

    getMedias() {
        return this.medias;
    }

    getByCategory(cat) {
        // CORREÇÃO: Era this.videos (undefined), mudado para this.medias
        return this.medias.filter(v => v.category === cat);
    }
    
    getById(id) {
        return this.medias.find(v => v.id === id);
    }
}

// 2. VIEW
class MediaView {
    constructor() {
        this.app = document.getElementById('app');
    }

    // CORREÇÃO: Atualizado para renderizar os dados do Youtube, não o formato antigo 'image/video'
    render(medias) {
        if (!medias || medias.length === 0) {
            this.app.innerHTML = "<p>Nenhum item encontrado.</p>";
            return;
        }

        this.app.innerHTML = `
            <h2>Todos os Vídeos</h2>
            <div class="video-grid">
                ${medias.map(item => this._createCardHTML(item)).join('')}
            </div>
        `;
    }

    renderList(videos, category) {
        this.app.innerHTML = `
            <h2>Categoria: ${category.toUpperCase()}</h2>
            <div class="video-grid">
                ${videos.map(v => this._createCardHTML(v)).join('')}
            </div>
            <br><a href="#/">🏠 Voltar para Home</a>
        `;
    }

    // Método auxiliar para evitar repetição de código HTML
    _createCardHTML(item) {
        return `
            <div class="card">
                <h3>${item.title}</h3>
                <a href="#/video/${item.category}/${item.id}">
                    <img src="https://img.youtube.com/vi/${item.id}/mqdefault.jpg" alt="${item.title}">
                </a>
                <p><a href="#/video/${item.category}/${item.id}">Assistir agora</a></p>
            </div>
        `;
    }
    
    renderPlayer(id, category) {
        this.app.innerHTML = `
            <div class="video-container">
                <h2>Assistindo Vídeo</h2>
                <iframe 
                    width="100%" 
                    height="450" 
                    src="https://www.youtube.com/embed/${id}" 
                    frameborder="0" 
                    allowfullscreen>
                </iframe>
                <br>
                <a href="#/video/${category}">⬅ Voltar para ${category}</a> | 
                <a href="#/">🏠 Home</a>
            </div>
        `;
    }
}

// 3. CONTROLLER
class MediaController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    // Ação da Home
    index() {
        const data = this.model.getMedias();
        this.view.render(data);
    }

    // Ação de Categoria
    category(cat) {
        const videos = this.model.getByCategory(cat);
        if (videos.length === 0) {
            document.getElementById('app').innerHTML = `
                <h2>Ops!</h2>
                <p>Nenhum vídeo encontrado na categoria <b>${cat}</b>.</p>
                <a href="#/">Voltar</a>
            `;
            return;
        }
        this.view.renderList(videos, cat);
    }

    // Ação de Player
    play(id, cat) {
        this.view.renderPlayer(id, cat);
    }
}

// Instâncias globais para uso nas rotas (Pattern Singleton simples)
const model = new MediaModel();
const view = new MediaView();
const controller = new MediaController(model, view);

// Definição das Rotas
const routes = {
    '#/': () => {
        console.log("Home carregada");
        controller.index();
    },
    '#/about': () => {
        document.getElementById('app').innerHTML = "<h1>Sobre Nós</h1><p>Projeto MVC com Router corrigido!</p><a href='#/'>Voltar</a>";
    },
    '#/user/([0-9]+)': (params) => {
        document.getElementById('app').innerHTML = `<h1>Perfil do Usuário</h1><p>ID: ${params[0]}</p><a href='#/'>Voltar</a>`;
    },
    // Rota de Categoria
    '#/video/([\\w-]+)': (params) => {
        const categoria = params[0];
        controller.category(categoria);
    },
    // Rota do Player (Categoria/ID)
    '#/video/([\\w-]+)/([\\w-]+)': (params) => {
        const [categoria, videoId] = params;
        controller.play(videoId, categoria);
    }
};

// Inicializa o roteador
const router = new Router(routes);
