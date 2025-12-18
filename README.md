# product-app-front

<img width="551" height="341" alt="image" src="https://github.com/user-attachments/assets/063fe143-8ac7-4b1c-9977-0adacd19a780" />

---
## Como executar em modo de desenvolvimento

Basta fazer o download do projeto e abrir o arquivo index.html no seu browser.

## Como executar através do Docker

Certifique-se de ter o [Docker](https://docs.docker.com/engine/install/) instalado e em execução em sua máquina.

Navegue até o diretório que contém o Dockerfile no terminal e seus arquivos de aplicação e
Execute **como administrador** o seguinte comando para construir a imagem Docker:

```
$ docker build -t nome_da_sua_imagem .
```

Uma vez criada a imagem, para executar o container basta executar, **como administrador**, seguinte o comando:

```
$ docker run -d -p 8082:80 product_app_front
```

Uma vez executando, para acessar o front-end, basta abrir o [http://localhost:8080/](http://localhost:8082/) no navegador.
