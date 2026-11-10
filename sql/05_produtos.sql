USE joel_barber;

CREATE TABLE IF NOT EXISTS produtos (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(120) NOT NULL,
    descricao VARCHAR(255) NULL,
    preco DECIMAL(10,2) NOT NULL,
    categoria ENUM('cabelo','barba','acabamento','acessorios') NOT NULL DEFAULT 'cabelo',
    imagem_url VARCHAR(1000) NULL,
    ativo TINYINT(1) NOT NULL DEFAULT 1,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Produtos iniciais que já apareciam na página antiga.
INSERT INTO produtos (nome, descricao, preco, categoria, imagem_url, ativo)
SELECT 'Pomada Modeladora', 'Fixação forte', 30.00, 'cabelo', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbHe-d5bxwVuipawpkIu_7dUg3pABPps1VF6ho0AlUscNOOixC', 1
WHERE NOT EXISTS (SELECT 1 FROM produtos WHERE nome = 'Pomada Modeladora');
INSERT INTO produtos (nome, descricao, preco, categoria, imagem_url, ativo)
SELECT 'Óleo para barba', 'Hidratação intensa', 45.00, 'barba', 'https://product-data.raiadrogasil.io/images/3503779.webp', 1
WHERE NOT EXISTS (SELECT 1 FROM produtos WHERE nome = 'Óleo para barba');
INSERT INTO produtos (nome, descricao, preco, categoria, imagem_url, ativo)
SELECT 'Spray Fixador', 'Fixação leve', 35.00, 'acabamento', 'https://americanas.vtexassets.com/arquivos/ids/414852/4957474448_2_xlarge.jpg?v=638750818717000000', 1
WHERE NOT EXISTS (SELECT 1 FROM produtos WHERE nome = 'Spray Fixador');
INSERT INTO produtos (nome, descricao, preco, categoria, imagem_url, ativo)
SELECT 'Shampoo para barba', 'Limpeza suave', 30.00, 'barba', 'https://http2.mlstatic.com/D_Q_NP_779993-MLA99855004595_112025-O.webp', 1
WHERE NOT EXISTS (SELECT 1 FROM produtos WHERE nome = 'Shampoo para barba');
INSERT INTO produtos (nome, descricao, preco, categoria, imagem_url, ativo)
SELECT 'Balm Pós-Barba', 'Hidrata e acalma', 40.00, 'barba', 'https://http2.mlstatic.com/D_Q_NP_913786-MLA84471756473_052025-O.webp', 1
WHERE NOT EXISTS (SELECT 1 FROM produtos WHERE nome = 'Balm Pós-Barba');
INSERT INTO produtos (nome, descricao, preco, categoria, imagem_url, ativo)
SELECT 'Condicionador', 'Cabelos hidratados', 35.00, 'cabelo', 'https://down-br.img.susercontent.com/file/br-11134201-81z1k-mdw7dmuxiuip67', 1
WHERE NOT EXISTS (SELECT 1 FROM produtos WHERE nome = 'Condicionador');
