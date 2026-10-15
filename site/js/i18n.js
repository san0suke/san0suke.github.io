export const LANGUAGES = ['pt', 'en'];

export function normalizeLanguage(value) {
  const language = String(value || '').trim().toLowerCase().split(/[-_]/)[0];
  return LANGUAGES.includes(language) ? language : null;
}

export function resolveLanguage(search = '', stored = null) {
  const params = new URLSearchParams(search);
  if (params.has('lang')) return normalizeLanguage(params.get('lang')) || 'pt';
  return normalizeLanguage(stored) || 'pt';
}

export function languageUrl(href, language) {
  const url = new URL(href);
  url.searchParams.set('lang', normalizeLanguage(language) || 'pt');
  return `${url.pathname}${url.search}${url.hash}`;
}

const ui = {
  pt: {
    skip: 'Pular para o conteúdo', loading: 'Carregando a experiência', languageLabel: 'Idioma do site',
    loaderKicker: 'UM POUCO DE MIM, EM MOVIMENTO', progress: 'Vídeo', loaderStatus: 'Preparando a experiência',
    retry: 'Tentar novamente', skipVideo: 'Continuar com imagem estática',
    brand: 'Robson Cesar de Siqueira, início', menu: 'Menu', navLabel: 'Navegação principal',
    navAbout: 'Sobre', navCareer: 'Experiência', navNumbers: 'Em números', navTech: 'Tecnologias', navProjects: 'Projetos', navContact: 'Contato',
    heroEyebrow: 'SOFTWARE ENGINEER · CURITIBA, BRASIL', heroTitle: 'Engenharia mobile.<br><em>Experiências<br>que conectam.</em>',
    heroDescription: 'Sou Robson. Transformo complexidade em produtos digitais que fazem sentido para as pessoas.',
    heroCta: 'CONHEÇA MEU TRABALHO', heroScroll: 'ROLE PARA AVANÇAR', heroEdition: 'IDEIAS. ENGENHARIA. EXPERIÊNCIAS.',
    aboutEyebrow: '01 — ALÉM DA INTERFACE', aboutTitle: 'O que acontece por trás<br><em>faz toda a diferença.</em>',
    aboutFirst: 'Da primeira interação aos sistemas que a sustentam, gosto de construir software com cuidado. Minha trajetória conecta desenvolvimento web, engenharia mobile, liderança técnica e SDKs para jogos.',
    aboutSecond: 'Hoje, trabalho com iOS na Public.com, colaborando em inglês com uma equipe internacional para evoluir experiências de investimento.',
    aboutCaption: 'DO CÓDIGO À EXPERIÊNCIA', careerEyebrow: '02 — TRAJETÓRIA PROFISSIONAL',
    careerTitle: 'Experiência construída em produtos digitais <em>de grande escala.</em>', careerCaption: 'De 2010 até agora. Role para acompanhar.', careerList: 'Trajetória profissional em ordem cronológica',
    careerFirstTitle: 'As primeiras linhas', careerFirstRole: 'Design e desenvolvimento de software', careerFirstText: 'Cartago, Web Storm, Webway e KMM: design, PHP, aplicações web, Java e Delphi.',
    hsbcRole: 'Desenvolvedor Java Web', hsbcText: 'Java Web e sistemas corporativos em ambiente Linux.',
    elaborataRole: 'Professor de desenvolvimento', elaborataText: 'Professor de desenvolvimento web e banco de dados. Conhecimento compartilhado depois do expediente.',
    msiRole: 'Engenharia de software', msiText: 'ERP multiplataforma, serviços Java, interfaces web e infraestrutura na AWS.',
    bradescoRole: 'Tech Lead & Desenvolvedor Mobile', bradescoText: 'Mais de seis anos entre Java Web e aplicações mobile. Liderança técnica iOS, desenvolvimento nativo e automação de build e entrega.',
    playRole: 'Engenharia mobile & SDK · TECLA', playText: 'SDK multiplataforma para iOS e Android e integração com Unity. Colaboração em jogos como Tetris, Solitaire e myVEGAS Slots.',
    publicRole: 'Desenvolvedor iOS Sênior', publicText: 'Onboarding e experiências financeiras para o mercado norte-americano. Interfaces nativas, programação reativa e testes em uma equipe global.',
    current: 'Atual', numberEyebrow: '03 — EXPERIÊNCIA EM NÚMEROS', numberTitle: 'Tempo que se transforma<br><em>em repertório.</em>',
    years: 'ANOS DE EXPERIÊNCIA', days: 'DIAS ÚTEIS ESTIMADOS', hours: 'HORAS ESTIMADAS DE DEDICAÇÃO',
    live: 'UMA HISTÓRIA QUE CONTINUA', motionPermission: 'Ativar movimentação', motionEnabled: 'Movimentação ativada', motionRequesting: 'Ativando movimentação…', method: 'Como calculamos',
    techEyebrow: '04 — TECNOLOGIAS', techTitle: 'Da ideia <em>ao produto.</em>', techLead: 'Explore as peças<br>que fazem parte do meu trabalho.', carouselRole: 'carrossel',
    stageLabel: 'Tecnologias em três dimensões. Use as setas para navegar.', stageLoading: 'Preparando as tecnologias…',
    previousTech: 'Tecnologia anterior', nextTech: 'Próxima tecnologia', techHint: 'Arraste os cubos ou use as setas para explorar.',
    projectsEyebrow: '05 — CURIOSIDADE QUE VIRA PROJETO', projectsTitle: 'Também construo<br><em>por curiosidade.</em>',
    projectsIntro: 'Algumas ideias ganham vida fora do trabalho.<br>Um espaço para experimentar, aprender e compartilhar.',
    openSource: 'Código aberto', openSourceText: 'Experimentos e projetos no GitHub', pagSeguro: 'PagSeguro Assinaturas', pagSeguroText: 'Integração e desenvolvimento web',
    forgenatorText: 'Uma experiência independente com Unity', contactEyebrow: 'O PRÓXIMO CAPÍTULO',
    contactTitle: 'Boas experiências<br>começam com<br><em>uma conversa.</em>',
    footerLocation: 'CURITIBA, BRASIL · CRIADO COM INTENÇÃO', reduceMotion: 'Reduzir movimento', enableMotion: 'Ativar animações',
    backTop: 'Voltar ao início', dialogTitle: 'Como calculamos', closeDialog: 'Fechar explicação',
    calculation: 'Estimativa atualizada diariamente. Considera os períodos profissionais desde outubro de 2010, sem duplicar vínculos simultâneos: 8 horas por dia de segunda a sexta, mais 3 horas por noite na Elaborata, entre janeiro de 2015 e abril de 2018. Julho de 2014 fica fora do cálculo. Férias, feriados e afastamentos não são descontados; como as datas informam mês e ano, usamos meses completos. Anos consideram o tempo dos vínculos; dias representam dias de semana, e as aulas acrescentam horas. Atualizado em <span id="calculation-date"></span>.',
    loaderReady: 'Pronto para explorar', loaderPreparing: 'Preparando o vídeo para a sua primeira visita', loaderWait: 'Carregando o vídeo completo. Só mais um instante.',
    loaderError: 'Não foi possível preparar o vídeo. Tente novamente ou continue com a imagem.', motionDenied: 'Movimento não autorizado', motionUnavailable: 'Movimento indisponível neste navegador',
    areaMobile: 'MOBILE', areaBackendMobile: 'BACKEND & MOBILE', areaGamesSdk: 'JOGOS & SDK', areaGames: 'JOGOS', areaWeb: 'WEB', areaWebBackend: 'WEB & BACKEND', areaData: 'DADOS', areaEngineering: 'ENGENHARIA', areaBackend: 'BACKEND', areaTools: 'FERRAMENTAS', areaInfrastructure: 'INFRAESTRUTURA', areaQuality: 'QUALIDADE'
  },
  en: {
    skip: 'Skip to content', loading: 'Loading the experience', languageLabel: 'Site language',
    loaderKicker: 'A LITTLE ABOUT ME, IN MOTION', progress: 'Video', loaderStatus: 'Preparing your experience',
    retry: 'Try again', skipVideo: 'Continue with a still image',
    brand: 'Robson Cesar de Siqueira, home', menu: 'Menu', navLabel: 'Main navigation',
    navAbout: 'About', navCareer: 'Experience', navNumbers: 'By the numbers', navTech: 'Technologies', navProjects: 'Projects', navContact: 'Contact',
    heroEyebrow: 'SOFTWARE ENGINEER · CURITIBA, BRAZIL', heroTitle: 'Mobile engineering.<br><em>Experiences<br>that connect.</em>',
    heroDescription: 'I’m Robson. I turn complexity into digital products that make sense for people.',
    heroCta: 'EXPLORE MY WORK', heroScroll: 'SCROLL TO EXPLORE', heroEdition: 'IDEAS. ENGINEERING. EXPERIENCES.',
    aboutEyebrow: '01 — BEYOND THE INTERFACE', aboutTitle: 'What happens behind the scenes<br><em>makes all the difference.</em>',
    aboutFirst: 'From the first interaction to the systems that support it, I care about building software thoughtfully. My career connects web development, mobile engineering, technical leadership, and game SDKs.',
    aboutSecond: 'I currently work on iOS at Public.com, collaborating in English with an international team to improve investing experiences.',
    aboutCaption: 'FROM CODE TO EXPERIENCE', careerEyebrow: '02 — PROFESSIONAL JOURNEY',
    careerTitle: 'Experience built across <em>large-scale digital products.</em>', careerCaption: 'From 2010 to today. Scroll to follow the journey.', careerList: 'Professional journey in chronological order',
    careerFirstTitle: 'The first lines of code', careerFirstRole: 'Software design and development', careerFirstText: 'Cartago, Web Storm, Webway, and KMM: design, PHP, web applications, Java, and Delphi.',
    hsbcRole: 'Java Web Developer', hsbcText: 'Java Web and enterprise systems in a Linux environment.',
    elaborataRole: 'Development Instructor', elaborataText: 'Taught web development and databases, sharing knowledge after the workday.',
    msiRole: 'Software Engineering', msiText: 'Cross-platform ERP, Java services, web interfaces, and AWS infrastructure.',
    bradescoRole: 'Tech Lead & Mobile Developer', bradescoText: 'More than six years across Java Web and mobile apps. iOS technical leadership, native development, and build and release automation.',
    playRole: 'Mobile Engineering & SDK · TECLA', playText: 'Cross-platform SDK for iOS and Android, integrated with Unity. Contributed to games including Tetris, Solitaire, and myVEGAS Slots.',
    publicRole: 'Senior iOS Developer', publicText: 'Onboarding and financial experiences for the US market. Native interfaces, reactive programming, and testing with a global team.',
    current: 'Present', numberEyebrow: '03 — EXPERIENCE IN NUMBERS', numberTitle: 'Time turned<br><em>into perspective.</em>',
    years: 'YEARS OF EXPERIENCE', days: 'ESTIMATED WORKDAYS', hours: 'ESTIMATED HOURS OF DEDICATION',
    live: 'A STORY STILL UNFOLDING', motionPermission: 'Enable device motion', motionEnabled: 'Device motion enabled', motionRequesting: 'Enabling motion…', method: 'How we calculate this',
    techEyebrow: '04 — TECHNOLOGIES', techTitle: 'From idea <em>to product.</em>', techLead: 'Explore the building blocks<br>behind my work.', carouselRole: 'carousel',
    stageLabel: 'Technologies in three dimensions. Use the arrows to navigate.', stageLoading: 'Loading technologies…',
    previousTech: 'Previous technology', nextTech: 'Next technology', techHint: 'Drag the cubes or use the arrows to explore.',
    projectsEyebrow: '05 — CURIOSITY BECOMES A PROJECT', projectsTitle: 'I also build<br><em>out of curiosity.</em>',
    projectsIntro: 'Some ideas come to life outside of work.<br>A space to experiment, learn, and share.',
    openSource: 'Open source', openSourceText: 'Experiments and projects on GitHub', pagSeguro: 'PagSeguro Subscriptions', pagSeguroText: 'Integration and web development',
    forgenatorText: 'An independent experience built with Unity', contactEyebrow: 'THE NEXT CHAPTER',
    contactTitle: 'Great experiences<br>start with<br><em>a conversation.</em>',
    footerLocation: 'CURITIBA, BRAZIL · MADE WITH INTENTION', reduceMotion: 'Reduce motion', enableMotion: 'Enable animations',
    backTop: 'Back to top', dialogTitle: 'How we calculate this', closeDialog: 'Close explanation',
    calculation: 'Updated daily. This estimate covers professional work since October 2010 without double-counting overlapping jobs: 8 hours a day, Monday through Friday, plus 3 evening teaching hours at Elaborata from January 2015 through April 2018. July 2014 is excluded. Vacation, holidays, and leave are not deducted. Since the source dates specify months and years, we count complete months. Years reflect time in the roles; days represent weekdays, and teaching adds hours. Updated on <span id="calculation-date"></span>.',
    loaderReady: 'Ready to explore', loaderPreparing: 'Preparing the video for your first visit', loaderWait: 'Loading the full video. Just a moment longer.',
    loaderError: 'The video could not be prepared. Try again or continue with the still image.', motionDenied: 'Motion permission was denied', motionUnavailable: 'Motion is unavailable in this browser',
    areaMobile: 'MOBILE', areaBackendMobile: 'BACKEND & MOBILE', areaGamesSdk: 'GAMES & SDK', areaGames: 'GAMES', areaWeb: 'WEB', areaWebBackend: 'WEB & BACKEND', areaData: 'DATA', areaEngineering: 'ENGINEERING', areaBackend: 'BACKEND', areaTools: 'TOOLS', areaInfrastructure: 'INFRASTRUCTURE', areaQuality: 'QUALITY'
  }
};

const technologyEnglish = {
  swift:['Swift. Care in every interaction.','Native iOS development with UIKit, SwiftUI, Combine, and RxSwift. From architecture to testing, the focus is a smooth, reliable experience.'],
  kotlin:['Kotlin. Clarity for the Android world.','Android apps and cross-platform SDKs, with well-structured code, service integration, and collaboration across mobile teams.'],
  java:['Java. A foundation for large systems.','Experience with enterprise applications, Java Web, REST APIs, financial systems, and Android development.'],
  unity:['Unity. Ideas brought to life.','Game development and SDK integration with Unity, connecting native code with cross-platform projects.'],
  csharp:['C#. The systems behind interaction.','Unity programming, SDK wrappers, and the logic that powers interactive experiences.'],
  javascript:['JavaScript. Experiences beyond mobile.','Web interfaces and cross-platform apps with HTML, CSS, JavaScript, jQuery, and Cordova, including ERP solutions.'],
  php:['PHP. Bringing ideas to the web.','Web development, WordPress, and integrations, along with teaching PHP and web development practices.'],
  postgresql:['PostgreSQL. A structure built to scale.','Database modeling and integration for enterprise applications, with additional experience in MySQL, SQL Server, and Oracle.'],
  git:['Git. A history of collaboration.','Version control, Gitflow collaboration, and build and delivery pipelines, including Jenkins and Bitbucket.'],
  uikit:['UIKit. Native iOS interfaces.','Building and evolving iOS interfaces with UIKit, including onboarding flows and financial products.'],
  swiftui:['SwiftUI. Declarative interfaces.','Developing iOS interfaces with SwiftUI, connecting application state, presentation, and behavior.'],
  combine:['Combine. Reactive flows on iOS.','Reactive programming with Combine to organize events, state, and data flows in iOS applications.'],
  rxswift:['RxSwift. Reactivity in real applications.','Using RxSwift to develop and maintain reactive flows in iOS applications.'],
  android:['Android. Native experiences and SDKs.','Android development with Java and Kotlin, plus maintenance of cross-platform SDKs integrated into games.'],
  spm:['SPM. Dependencies in the Swift ecosystem.','Managing iOS dependencies with Swift Package Manager in the native development ecosystem.'],
  cocoapods:['CocoaPods. Libraries integrated into products.','Managing and integrating dependencies in iOS projects with CocoaPods.'],
  spring:['Spring. A framework for Java applications.','Experience with Spring and enterprise architectures in Java applications and services.'],
  struts:['Struts. Java Web for enterprise systems.','Developing and maintaining Java Web solutions with Struts in Bradesco’s application ecosystem.'],
  rest:['REST APIs. Services connecting platforms.','Developing and integrating RESTful services, including the Java backend of a cross-platform ERP.'],
  html:['HTML. The structure of the web experience.','Building web interfaces with HTML, from early web design work to cross-platform products.'],
  css:['CSS. Shape, layout, and presentation.','Styling web interfaces with CSS across websites and applications built throughout my career.'],
  jquery:['jQuery. Interactions in web applications.','Using jQuery and JavaScript on the frontend of a cross-platform ERP and other web interfaces.'],
  cordova:['Cordova. One interface, multiple platforms.','Building cross-platform ERP interfaces with Cordova, JavaScript, HTML, and CSS.'],
  wordpress:['WordPress. Content and web integrations.','WordPress development, including company websites and PHP integrations.'],
  mysql:['MySQL. Data and shared knowledge.','Experience with MySQL and teaching web development and databases at Elaborata.'],
  sqlserver:['SQL Server. Data for enterprise environments.','Experience with SQL Server as one of the database tools used throughout my career.'],
  oracle:['Oracle. Enterprise databases.','Experience with Oracle among the data technologies used in enterprise applications.'],
  sql:['SQL. Queries that make data useful.','Using SQL with databases and in the development of enterprise applications.'],
  jenkins:['Jenkins. From code to delivery.','Automating application builds and delivery with Jenkins, including mobile projects at Bradesco.'],
  jira:['Jira. Organizing collaborative work.','Using Jira to coordinate and collaborate on software development with engineering teams.'],
  confluence:['Confluence. Knowledge shared across teams.','Using Confluence for collaboration and documentation within software development teams.'],
  bitbucket:['Bitbucket. Version control and collaboration.','Managing Git repositories and collaborating on software projects with Bitbucket.'],
  bamboo:['Bamboo. Automation across development.','Experience with Bamboo among the engineering tools used at Bradesco.'],
  aws:['AWS. Infrastructure for digital products.','Configuring AWS infrastructure and databases to host MSI Solutions’ ERP and company website.'],
  linux:['Linux. Systems and servers.','Working in Linux environments during Java development and while managing server data and logs.'],
  shell:['Shell Script. Command-line automation.','Using Shell Script to manage data and logs on Linux servers for HSBC internal systems.'],
  delphi:['Delphi. A career that also spans desktop software.','Experience with Java and Delphi at KMM and in modernizing an ERP originally built in Delphi.'],
  aseprite:['Aseprite. Art for independent game development.','Using Aseprite among the production tools for the independent game Forgenator.'],
  audacity:['Audacity. Audio in the creative process.','Using Audacity among the production tools for the independent game Forgenator.'],
  visualstudio:['Visual Studio. Code for interactive experiences.','Using Visual Studio to develop the independent game Forgenator with Unity and C#.'],
  unittests:['Unit Tests. Confidence in product behavior.','Creating and maintaining iOS unit tests to support stability and prevent regressions.'],
  uitests:['UI Tests. Confidence in the complete experience.','Creating and maintaining automated interface tests to validate iOS flows and prevent regressions.']
};

export function text(language, key) { return ui[language]?.[key] ?? ui.pt[key] ?? key; }
export function localizedTechnology(item, language) {
  const copy = language === 'en' ? technologyEnglish[item.id] : null;
  const areaKey = `area${({MOBILE:'Mobile', 'BACKEND & MOBILE':'BackendMobile','JOGOS & SDK':'GamesSdk',JOGOS:'Games',WEB:'Web','WEB & BACKEND':'WebBackend',DADOS:'Data',ENGENHARIA:'Engineering',BACKEND:'Backend',FERRAMENTAS:'Tools',INFRAESTRUTURA:'Infrastructure',QUALIDADE:'Quality'})[item.area] || 'Mobile'}`;
  return {...item, title:copy?.[0] || item.title, description:copy?.[1] || item.description, area:text(language,areaKey), category:language==='en'?({Mobile:'Mobile',Backend:'Backend',Jogos:'Games',Web:'Web',Dados:'Data',Ferramentas:'Tools',Infraestrutura:'Infrastructure',Qualidade:'Quality'}[item.category]||item.category):item.category};
}
