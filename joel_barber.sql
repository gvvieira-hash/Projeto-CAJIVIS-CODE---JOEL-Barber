-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: joel_barber
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `administradores`
--

DROP TABLE IF EXISTS `administradores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `administradores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(150) NOT NULL,
  `senha_hash` varchar(255) NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `administradores`
--

LOCK TABLES `administradores` WRITE;
/*!40000 ALTER TABLE `administradores` DISABLE KEYS */;
INSERT INTO `administradores` VALUES (1,'joeladmin@gmail.com','$2b$12$mt1OURXAzQw0Yx6cvL1Q4uQUu6kXz7hIZBH9RmYwXtvtWPDCVIXRG','2026-10-21 12:41:24');
/*!40000 ALTER TABLE `administradores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `agendamentos`
--

DROP TABLE IF EXISTS `agendamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agendamentos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cliente_id` int(11) NOT NULL,
  `servico_id` int(11) NOT NULL,
  `data_agendamento` date NOT NULL,
  `hora_agendamento` time NOT NULL,
  `status` enum('agendado','confirmado','concluido','cancelado') DEFAULT 'agendado',
  `observacoes` varchar(500) DEFAULT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `barbeiro_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cliente_id` (`cliente_id`),
  KEY `servico_id` (`servico_id`),
  KEY `fk_agendamento_barbeiro` (`barbeiro_id`),
  CONSTRAINT `agendamentos_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`),
  CONSTRAINT `agendamentos_ibfk_2` FOREIGN KEY (`servico_id`) REFERENCES `servicos` (`id`),
  CONSTRAINT `fk_agendamento_barbeiro` FOREIGN KEY (`barbeiro_id`) REFERENCES `barbeiros` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agendamentos`
--

LOCK TABLES `agendamentos` WRITE;
/*!40000 ALTER TABLE `agendamentos` DISABLE KEYS */;
INSERT INTO `agendamentos` VALUES (12,2,2,'2026-10-22','14:00:00','cancelado',NULL,'2026-10-22 13:28:46',3),(13,5,3,'2026-10-22','10:30:00','concluido',NULL,'2026-10-22 13:29:54',1),(14,1,1,'2026-10-22','15:30:00','concluido',NULL,'2026-10-22 13:31:21',1),(15,1,3,'2026-10-31','15:30:00','cancelado',NULL,'2026-10-22 13:39:41',4),(16,4,1,'2026-10-30','14:00:00','cancelado',NULL,'2026-10-27 12:49:39',2),(17,3,2,'2026-10-27','14:00:00','cancelado',NULL,'2026-10-27 13:38:10',1),(18,1,1,'2026-10-27','15:30:00','concluido',NULL,'2026-10-27 14:46:01',1),(19,1,3,'2026-10-28','10:30:00','concluido',NULL,'2026-10-27 14:46:35',3),(20,4,1,'2026-10-27','15:30:00','cancelado',NULL,'2026-10-27 14:48:19',2),(21,4,4,'2026-10-28','14:00:00','concluido',NULL,'2026-10-28 11:24:13',4),(22,1,3,'2026-11-09','14:00:00','cancelado',NULL,'2026-11-09 10:50:13',2);
/*!40000 ALTER TABLE `agendamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `barbeiros`
--

DROP TABLE IF EXISTS `barbeiros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `barbeiros` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `barbeiros`
--

LOCK TABLES `barbeiros` WRITE;
/*!40000 ALTER TABLE `barbeiros` DISABLE KEYS */;
INSERT INTO `barbeiros` VALUES (1,'Carlos Pablo',1),(2,'Guilherme Vieira',1),(3,'Deivisson Rocha',1),(4,'Saulo Farias',1);
/*!40000 ALTER TABLE `barbeiros` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `telefone` varchar(20) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `senha_hash` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes`
--

LOCK TABLES `clientes` WRITE;
/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
INSERT INTO `clientes` VALUES (1,'Deivisson','71982379903','deivisson@gmail.com','2026-10-21 14:47:57','$2b$10$UtcX2DcEb7ykU8ZoVteme.u1t0X2PNKhW1MjJ./oJgp5hK4pQQSzS'),(2,'Carlos','71982379901','carlos@gmail.com','2026-10-22 11:28:46','$2b$10$39KrLe812CjZVy0MszZjdOfC1g7zc7qbxk77XvLtpra5ScMHaQDoC'),(3,'Saulo','71982379900','saulo@gmail.com','2026-10-22 11:35:58','$2b$10$ikbB2GVfm9Ln0Q/71pA7KeWW8DQh8s7.lmekKkztSHW.zqAOogp16'),(4,'guilherme','71981298316','guilherme69@gmail.com','2026-10-22 12:04:05','$2b$10$kU5Jvv4PglnLCnhQCjkcju9jN3o2yXcRTAqVTyB7R1FlUPKU7HL12'),(5,'Daniel','71982379907','daniel@gmail.com','2026-10-22 12:43:21','$2b$10$yly6wB6Mair4.52MjiS2Ru9yVCZMtsy4Lb3Hgiu8fZSR6StCjFZCu');
/*!40000 ALTER TABLE `clientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `produtos`
--

DROP TABLE IF EXISTS `produtos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `produtos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(120) NOT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  `preco` decimal(10,2) NOT NULL,
  `categoria` enum('cabelo','barba','acabamento','acessorios') NOT NULL DEFAULT 'cabelo',
  `imagem_url` varchar(1000) DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produtos`
--

LOCK TABLES `produtos` WRITE;
/*!40000 ALTER TABLE `produtos` DISABLE KEYS */;
INSERT INTO `produtos` VALUES (1,'Pomada Modeladora','Fixação forte',30.00,'cabelo','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbHe-d5bxwVuipawpkIu_7dUg3pABPps1VF6ho0AlUscNOOixC',1,'2026-11-09 12:13:24'),(2,'Óleo para barba','Hidratação intensa',45.00,'barba','https://product-data.raiadrogasil.io/images/3503779.webp',1,'2026-11-09 12:13:24'),(3,'Spray Fixador','Fixação leve',35.00,'acabamento','https://americanas.vtexassets.com/arquivos/ids/414852/4957474448_2_xlarge.jpg?v=638750818717000000',1,'2026-11-09 12:13:24'),(4,'Shampoo para barba','Limpeza suave',30.00,'barba','https://http2.mlstatic.com/D_Q_NP_779993-MLA99855004595_112025-O.webp',1,'2026-11-09 12:13:24'),(5,'Balm Pós-Barba','Hidrata e acalma',40.00,'barba','https://http2.mlstatic.com/D_Q_NP_913786-MLA84471756473_052025-O.webp',1,'2026-11-09 12:13:24'),(6,'Condicionador','Cabelos hidratados',35.00,'cabelo','https://down-br.img.susercontent.com/file/br-11134201-81z1k-mdw7dmuxiuip67',1,'2026-11-09 12:13:24'),(7,'Gel para Cabelo','Gel para cabelo',25.00,'cabelo','https://http2.mlstatic.com/D_NQ_NP_2X_910620-MLU77880640049_072024-F.webp',1,'2026-11-09 12:13:27');
/*!40000 ALTER TABLE `produtos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servicos`
--

DROP TABLE IF EXISTS `servicos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `servicos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `preco` decimal(10,2) NOT NULL,
  `duracao_minutos` int(11) NOT NULL,
  `ativo` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servicos`
--

LOCK TABLES `servicos` WRITE;
/*!40000 ALTER TABLE `servicos` DISABLE KEYS */;
INSERT INTO `servicos` VALUES (1,'Corte de Cabelo',45.00,40,1),(2,'Barba',30.00,30,1),(3,'Cabelo + Barba',65.00,60,1),(4,'Sobrancelha',15.00,15,1);
/*!40000 ALTER TABLE `servicos` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-09  9:31:31
