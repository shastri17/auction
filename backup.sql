--
-- PostgreSQL database dump
--

\restrict M3IbtrBOzhD1g5dRLWdTcSCX7TF6mhSIuxqpbtBwbCtMJ3HKima6ySTCyvZdAxB

-- Dumped from database version 15.14
-- Dumped by pg_dump version 15.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: auctions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auctions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    status text DEFAULT 'active'::text,
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    current_player_id uuid,
    current_bid bigint DEFAULT 0,
    winning_team_id uuid,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.auctions OWNER TO postgres;

--
-- Name: bids; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bids (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    auction_id uuid NOT NULL,
    player_id uuid NOT NULL,
    team_id uuid NOT NULL,
    amount bigint NOT NULL,
    is_winning boolean DEFAULT false,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.bids OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    min_age bigint,
    max_age bigint,
    gender text,
    type text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: player_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.player_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    player_id uuid NOT NULL,
    category_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.player_categories OWNER TO postgres;

--
-- Name: players; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.players (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    gender text NOT NULL,
    date_of_birth timestamp with time zone NOT NULL,
    mobile text NOT NULL,
    playing_category text NOT NULL,
    accomplishments text,
    is_retained boolean DEFAULT false,
    retained_by uuid,
    current_team_id uuid,
    base_price bigint DEFAULT 200,
    current_price bigint DEFAULT 200,
    is_sold boolean DEFAULT false,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.players OWNER TO postgres;

--
-- Name: retained_players; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.retained_players (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    player_id uuid NOT NULL,
    team_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.retained_players OWNER TO postgres;

--
-- Name: teams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teams (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    total_points bigint DEFAULT 12000,
    used_points bigint DEFAULT 0,
    player_count bigint DEFAULT 0,
    min_players bigint DEFAULT 12,
    max_players bigint DEFAULT 20,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.teams OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role text DEFAULT 'player'::text NOT NULL,
    team_id uuid,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: auctions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auctions (id, title, status, start_time, end_time, current_player_id, current_bid, winning_team_id, created_at, updated_at) FROM stdin;
e21d37b0-20d5-4718-9e33-44ca77b7372e	Manual Player Auction Session	completed	0001-01-01 00:00:00+00	2025-09-06 16:53:19.540299+00	\N	0	\N	2025-09-06 16:53:16.753278+00	2025-09-06 16:53:19.540447+00
eadb113b-6d3d-45a5-8987-4c95a34b892f	Manual Player Auction Session	completed	0001-01-01 00:00:00+00	2025-09-07 09:43:39.916284+00	\N	0	\N	2025-09-07 05:18:26.574641+00	2025-09-07 09:43:39.916379+00
a47d5312-318d-4637-aeef-cd0a8a41448b	Manual Player Auction Session	completed	0001-01-01 00:00:00+00	2025-09-07 09:48:43.036154+00	\N	0	\N	2025-09-07 09:43:48.876842+00	2025-09-07 09:48:43.036269+00
fb8b2e88-6c6c-46e5-b102-63071277ccb5	Manual Player Auction Session	completed	0001-01-01 00:00:00+00	2025-09-07 09:49:26.476038+00	\N	0	\N	2025-09-07 09:48:57.339429+00	2025-09-07 09:49:26.476216+00
e345f2e7-0f1d-4d1b-aec3-90edf251d5df	Manual Player Auction Session	active	0001-01-01 00:00:00+00	\N	f6cea785-0a6d-424b-9330-4dd42c11db41	0	\N	2025-09-10 12:48:10.742924+00	2025-09-18 04:47:30.628956+00
\.


--
-- Data for Name: bids; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bids (id, auction_id, player_id, team_id, amount, is_winning, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, description, min_age, max_age, gender, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: player_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.player_categories (id, player_id, category_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: players; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.players (id, user_id, name, gender, date_of_birth, mobile, playing_category, accomplishments, is_retained, retained_by, current_team_id, base_price, current_price, is_sold, created_at, updated_at) FROM stdin;
f6486d79-4825-4764-b595-ada5cb70f99a	438bcc1f-4c96-4134-9cbc-1a95181d690b	Vinay Narasimha Joshi	male	1998-01-30 00:00:00+00	9482152838	Open Singles & Doubles	NA	f	\N	6d1ceb6e-113d-47a6-9d6f-34107f37131c	200	200	t	2025-09-06 16:18:56.023873+00	2025-09-07 08:33:03.684315+00
27ecc820-f7ad-4091-a167-21b8f3641fc0	fb2b5979-d0fe-4536-bb13-1f33c5887811	Mahabaleswara Bhatta HS	male	1954-02-04 00:00:00+00	9900329327	Open Singles & Doubles	Won/reached semifinals in several tournaments in my age category	f	\N	6d1ceb6e-113d-47a6-9d6f-34107f37131c	200	200	t	2025-09-06 16:18:56.139341+00	2025-09-07 08:42:57.889329+00
e3c9feb4-dcd9-41e3-b2f3-d9eff4b3c331	e9203cf7-5add-4b15-8faa-41a43da91178	Ramesh Ramakrishna Hegde	male	1967-05-05 00:00:00+00	9242040721	Men's Open Doubles	50+ category Singles Runner 2023, 50+ Dobles Winner 2024, Runner 2025	f	\N	6d1ceb6e-113d-47a6-9d6f-34107f37131c	200	1000	t	2025-09-06 16:18:56.075184+00	2025-09-07 06:16:07.37754+00
c610d14d-6692-4aff-86a1-00addb2dd022	cb229566-e6fe-4ec1-919b-c0737b4ddc56	Gurumurthy. M. Bhat	male	1978-05-17 00:00:00+00	9449587581	Men's Open Doubles	Intermediate	f	\N	e69a7f4e-5088-4bc0-aa4d-3a8c7cb0a596	200	2700	t	2025-09-06 16:18:56.09567+00	2025-09-07 06:31:50.189461+00
b09605d9-bd9a-439a-aa5b-ae64cd74da90	d0b2881b-f716-44cc-b2ec-0ef2acbcb99c	Madan Sharma	male	1986-01-26 00:00:00+00	9986717314	Open Singles & Doubles	Good control , proud to be part of 4 time habya 35+ second third round and last time HBL	f	\N	6d1ceb6e-113d-47a6-9d6f-34107f37131c	200	500	t	2025-09-06 16:18:56.153631+00	2025-09-07 07:17:18.319407+00
12208d82-62d8-4f4e-9a1e-78d8803393ee	9d887947-574e-4b32-8f5f-e2efdea59ef3	Charvi Ganesh	female	2013-12-24 00:00:00+00	9886458622	Open Singles & Doubles	Runner Up in HABYA, LOt of open junior wins.. 4th round in KBA ranking tournament	f	\N	dee0695f-dc4b-495a-a4e0-d1c2d113f720	200	500	t	2025-09-06 16:18:56.023873+00	2025-09-07 05:43:46.09215+00
c745aa7e-a3f0-49f1-b85e-fe6036e48ae9	d1b9c4ec-2d83-4c97-8938-74b866d2f5cb	Rachana S Hegde	female	2011-03-02 00:00:00+00	9844265349	Open Singles & Doubles	Semifinalist in under16 girls singles at Habya	f	\N	4654ff70-6b21-4fc4-b456-56a201b63535	200	200	t	2025-09-06 16:18:56.027754+00	2025-09-07 05:44:33.633825+00
5796b2f2-71db-432a-bd0c-759c1d4e13fb	0d2f15a3-191c-48dd-a253-d8cb6dee2cad	Manvi Hebbar	female	2010-11-01 00:00:00+00	9845997857	Open Singles & Doubles	50 plus trophies U13/U15 categories, played state level tournaments, Habya u16 MD runner up for two years	f	\N	dee0695f-dc4b-495a-a4e0-d1c2d113f720	200	900	t	2025-09-06 16:18:56.0313+00	2025-09-07 05:47:02.843783+00
8ca41f7c-a3e6-4b96-a20d-45365989a113	651af16a-38a4-4b34-b0b5-4bfe31753510	Vibhava K R	female	2011-04-09 00:00:00+00	8277454422	Women's Open Singles	Good player. I have National starting from 13th Oct. I will be available for HBL only if Nationals got re-schedule.	f	\N	22fe2b64-e93d-44bc-8119-c6da9550653f	200	800	t	2025-09-06 16:18:56.03475+00	2025-09-07 05:50:16.324368+00
9946e35a-7bfc-4702-9565-93365a6cabd6	d0e4469a-8f05-47f4-8be3-edd1b9bf4518	Avani.Anil . Bhat	female	2010-09-19 00:00:00+00	9035136575	Open Singles & Doubles	Intermediary	f	\N	6d1ceb6e-113d-47a6-9d6f-34107f37131c	200	200	t	2025-09-06 16:18:56.038062+00	2025-09-07 05:51:23.298819+00
9504c7a9-5730-4e7c-bd69-89be47519a89	77a37a63-0a6c-43c4-b6fa-f7d5c7f82383	Krutika Hegde	female	2009-04-12 00:00:00+00	8904878274	Open Singles & Doubles	NA	f	\N	e69a7f4e-5088-4bc0-aa4d-3a8c7cb0a596	200	200	t	2025-09-06 16:18:56.041525+00	2025-09-07 05:52:22.328551+00
88a402d0-7cdc-41c5-a52f-4634867e6796	2043537f-9c24-486f-9d4e-e7971dfa635c	Sugandhi S	female	1995-06-29 00:00:00+00	9740652239	Women's Open Doubles	Regular palyer at parkash courts and won habya tournament twice and twice runner up	f	\N	22fe2b64-e93d-44bc-8119-c6da9550653f	200	400	t	2025-09-06 16:18:56.047665+00	2025-09-07 05:54:37.489415+00
1439ac53-9844-4cc6-b91a-c7b382749fab	34a9e4e5-1246-45c3-a98f-864ed3b3cbd6	Raghavendra Hegde	male	1987-06-01 00:00:00+00	7337687920	Men's Open Doubles	Played state ranking open nationals …  3 years university captan in Badminton….	f	\N	dee0695f-dc4b-495a-a4e0-d1c2d113f720	200	1200	t	2025-09-06 16:18:56.05399+00	2025-09-07 05:58:45.775226+00
613f3d94-19e8-4f72-9b43-94f2b1c5e8ec	26a964b6-ca8a-4d0c-82fa-d83d0954cb57	Shrivathsa D N	male	1985-04-03 00:00:00+00	7977324834	Men's Open Doubles	"Winner of Kanachur Medical College Staff Singles & Doubles (3 consecutive years) and Runners-up in RGUHS Staff Doubles & IMA Doctors’ Mixed Doubles Badminton Tournaments.🔥 Daily evening badminton grind	f	\N	e69a7f4e-5088-4bc0-aa4d-3a8c7cb0a596	200	300	t	2025-09-06 16:18:56.057007+00	2025-09-07 06:00:06.509186+00
8dcb1680-c360-475b-a3f1-6ce5fbe33d05	01ca34ac-3d38-49e1-b496-55b31af3be01	Hariprasad Hegde	male	1988-03-26 00:00:00+00	8147756949	Open Singles & Doubles	olympic gold medal match enjoyed on tv	f	\N	4654ff70-6b21-4fc4-b456-56a201b63535	200	1600	t	2025-09-06 16:18:56.060033+00	2025-09-07 06:01:45.614189+00
a393aaea-1eb7-4dff-b51d-299999256fa6	45d24ce0-9a63-4bc9-b15f-fdcbb56fb8b7	Prakasha Mahabaleshwara Hegade	male	1990-07-24 00:00:00+00	8660189241	Men's Open Doubles	Regularly playing badminton for 10+ years.. Played in different tournaments and won company level tournaments	f	\N	6d1ceb6e-113d-47a6-9d6f-34107f37131c	200	200	t	2025-09-06 16:18:56.063154+00	2025-09-07 06:02:43.977875+00
1d1ebc71-5ab4-4b0d-bff4-eeada07b3a28	e3202d49-6cee-46ed-b59c-f533a0038b51	Sandesh Kumar H K	male	1988-01-12 00:00:00+00	9035292131	Open Singles & Doubles	Habya 2025,  35 plus	f	\N	e69a7f4e-5088-4bc0-aa4d-3a8c7cb0a596	200	3700	t	2025-09-06 16:18:56.069091+00	2025-09-07 06:11:57.737862+00
146c217d-796f-4883-8014-30816a265038	ef0768d7-3408-4065-8a3d-93274c4ab8a5	Nitin S hegde	male	1993-09-24 00:00:00+00	9538568780	Men's Open Doubles	None	f	\N	22fe2b64-e93d-44bc-8119-c6da9550653f	200	400	t	2025-09-06 16:18:56.193995+00	2025-09-07 07:50:22.091561+00
030cf6e3-ee3c-4ce2-b9ba-6851717ac050	8daa78d9-181b-49fd-b8d0-ccc0e6c98856	Dishalakshmi R Bhat	female	2005-01-02 00:00:00+00	8762213037	Open Singles & Doubles	Beginner	f	\N	e69a7f4e-5088-4bc0-aa4d-3a8c7cb0a596	200	200	t	2025-09-06 16:18:56.044696+00	2025-09-07 07:59:02.932136+00
a04af22d-3af9-4a00-9b99-fc6c42716f58	ca3ca2c8-6c5d-4c01-be6b-001f4fd5296c	Shishira K V	male	1988-02-25 00:00:00+00	8762288023	Open Singles & Doubles	Have been playing for sometime. My participation in tournaments is very less.	f	\N	dee0695f-dc4b-495a-a4e0-d1c2d113f720	200	200	t	2025-09-06 16:18:56.066184+00	2025-09-07 08:40:15.479622+00
fd4901cc-7405-4a47-912e-b80328ec76ed	0ac748bd-8c1d-4846-ba1f-52021a263a84	Deepika Hegde	female	1985-08-03 00:00:00+00	9632039633	Women's Open Doubles	10+ trophies, Habya 35+ WD winner,  Habya mixed age mixed doubles winner	f	\N	\N	200	200	f	2025-09-06 16:18:56.050808+00	2025-09-06 16:18:56.050808+00
deb64d05-a9e6-4e0e-9163-7c6d8487b52a	570b85cf-95cc-4114-94ba-a25fceae42cf	Dileep Laxminarayan Bhat	male	1987-06-13 00:00:00+00	9108849174	Men's Open Doubles	-	f	\N	\N	200	200	f	2025-09-06 16:18:56.072125+00	2025-09-06 16:18:56.072125+00
f6cea785-0a6d-424b-9330-4dd42c11db41	ba129c5b-a835-4fd6-b4da-2c746ea72ac9	Raghavendra M.S	male	1962-10-07 00:00:00+00	9448218795	Men's Open Doubles	60+runner up in habbya sigal& dubbels	f	\N	\N	200	200	f	2025-09-06 16:18:56.087054+00	2025-09-06 16:18:56.087054+00
b280b14e-acb4-4c32-b4a2-f40367973409	3c55e42a-f896-4d30-9b39-6a11210510e4	Vijay Hegde	male	1981-03-25 00:00:00+00	9448792246	Men's Open Doubles	.	f	\N	\N	200	200	f	2025-09-06 16:18:56.092787+00	2025-09-06 16:18:56.092787+00
eae7dc5e-4283-48fe-bfea-e2971389e973	88a429b4-9661-4305-a3ae-5b40dd64039e	Ganesha GR	male	1988-05-04 00:00:00+00	9481093615	Open Singles & Doubles	Played in Havyaka Tournament, Badmiton enthusiasts.	f	\N	\N	200	200	f	2025-09-06 16:18:56.101409+00	2025-09-06 16:18:56.101409+00
eb7ff2c0-6d4b-443e-8011-f1db6d445ef2	e1e33cd9-8216-4dc0-8dc2-cebc047da69b	Shrikant P Yalakki	male	1982-05-12 00:00:00+00	9538019876	Open Singles & Doubles	Sadhyakke entadu ille	f	\N	\N	200	200	f	2025-09-06 16:18:56.104431+00	2025-09-06 16:18:56.104431+00
e989f88d-b9b3-471e-a9b9-d3509da7c7c4	1388663e-f40f-46dd-ac54-b8920bf34df4	Suresh K	male	1963-10-15 00:00:00+00	9591104952	Open Singles & Doubles	Basic	f	\N	\N	200	200	f	2025-09-06 16:18:56.107274+00	2025-09-06 16:18:56.107274+00
45fcc765-d66d-4414-ba6b-aded64cba4cb	72ec6940-9483-4143-97a3-6a2c24e5f456	Adarsha M Hegde	male	1988-03-02 00:00:00+00	9611054999	Men's Open Doubles	Participated in HABYA	f	\N	\N	200	200	f	2025-09-06 16:18:56.110219+00	2025-09-06 16:18:56.110219+00
e60b532d-52d8-45cf-803c-5d0421c9f372	1a5684f1-329b-4974-9dc0-0268bc69476b	Ganapati Pandit	male	1972-07-17 00:00:00+00	9980140782	Men's Open Doubles	Habya finalist	f	\N	\N	200	200	f	2025-09-06 16:18:56.14673+00	2025-09-06 16:18:56.14673+00
3a7429fa-efa4-4bcb-bfad-7f763493041e	efbd6b90-0afd-481c-8d51-1cb4e536f520	Ramakrishna Bhat	male	1979-06-07 00:00:00+00	9980908723	Men's Open Doubles	Two season Winner in singles and doubles in office corporate tournament.	f	\N	\N	200	200	f	2025-09-06 16:18:56.150185+00	2025-09-06 16:18:56.150185+00
c8763609-c66a-488a-81b2-4a54deea002a	7bf41db1-603c-4928-bd7c-49634a8a23e3	Mahendra C V	male	1992-03-04 00:00:00+00	9591459460	Men's Open Doubles	Valaya/local tournaments	f	\N	\N	200	200	f	2025-09-06 16:18:56.187606+00	2025-09-06 16:18:56.187606+00
448bf51a-b4da-4b68-b86f-08d896832863	d01ff03d-8dae-47ff-ad5e-be029671186b	Vikram Hegde	male	1976-07-22 00:00:00+00	9448112071	Open Singles & Doubles	Participation	f	\N	e69a7f4e-5088-4bc0-aa4d-3a8c7cb0a596	200	200	t	2025-09-06 16:18:56.078232+00	2025-09-07 06:17:07.907198+00
0aff7e7e-5736-4c0e-b255-0353fb5d7ebe	f5706418-cbab-4c72-8ec8-5a60f6beb081	Narasimha Narayan Hegde	male	1975-12-17 00:00:00+00	9448135340	Men's Open Doubles	NA	f	\N	22fe2b64-e93d-44bc-8119-c6da9550653f	200	600	t	2025-09-06 16:18:56.081152+00	2025-09-07 06:19:34.527345+00
baa9ee31-00ef-472d-a043-f7975132eaa2	a2cb5600-d0cb-4d6f-8e90-deb3c38adac9	Gangadhar C Hegde	male	1964-07-22 00:00:00+00	9448339980	Open Singles & Doubles	Yes. National level player.	f	\N	22fe2b64-e93d-44bc-8119-c6da9550653f	200	400	t	2025-09-06 16:18:56.090077+00	2025-09-07 06:22:19.102072+00
09229c9f-cdf1-463d-9b25-c5dbe7e78cbf	9b067b5e-2c80-4d76-ba11-f4e3e575f872	Adarsha kote	male	1986-07-12 00:00:00+00	9620426426	Men's Open Doubles	Intermediate	f	\N	4654ff70-6b21-4fc4-b456-56a201b63535	200	200	t	2025-09-06 16:18:56.113155+00	2025-09-07 06:53:31.195373+00
2afbe275-630e-4e9f-9c03-da17c890fce5	8a7480de-c55f-41c5-a3c9-7349f7d477ab	Susharma KS	male	1986-05-28 00:00:00+00	9663554003	Open Singles & Doubles	Habya 2025 35+ singles semifinals, doubles quarter finals where lost to Manjann who were evntual champions.	f	\N	4654ff70-6b21-4fc4-b456-56a201b63535	200	700	t	2025-09-06 16:18:56.116026+00	2025-09-07 06:55:33.180048+00
deef19d4-207f-4dd2-bd78-8c8f2ffbcb91	6373780b-74e1-4c85-9e7e-768ff71c6481	Manoj shilageramane	male	1987-04-15 00:00:00+00	9673027695	Open Singles & Doubles	Good player	f	\N	4654ff70-6b21-4fc4-b456-56a201b63535	200	1200	t	2025-09-06 16:18:56.118942+00	2025-09-07 06:59:57.440517+00
42e7aeee-7687-4c88-a57d-0faeec9a6240	be34faaa-35c8-4529-9f5f-546ad7a3b560	Shrirang Ramachandra Hegde	male	1974-08-23 00:00:00+00	9844265349	Open Singles & Doubles	50+ singles runner up at Habya tournament	f	\N	6d1ceb6e-113d-47a6-9d6f-34107f37131c	200	200	t	2025-09-06 16:18:56.121863+00	2025-09-07 07:01:01.100853+00
83d6ad29-2138-4040-820e-80c9d08e5aad	b0901f59-466a-4e5c-9db1-281603d32676	Nagaraj Bhat	male	1974-09-03 00:00:00+00	9845566928	Open Singles & Doubles	Regularly playing	f	\N	6d1ceb6e-113d-47a6-9d6f-34107f37131c	200	900	t	2025-09-06 16:18:56.124733+00	2025-09-07 07:02:31.145675+00
b01ff46e-1588-4ee5-bcc1-f22b1dd9ebfc	89fbcc2a-ec66-4814-bcc9-f9676dfa35d7	Vineeth Diwakar Bhat	male	1973-03-25 00:00:00+00	9845693105	Men's Open Doubles	Won few tournaments in doubles	f	\N	dee0695f-dc4b-495a-a4e0-d1c2d113f720	200	1900	t	2025-09-06 16:18:56.127633+00	2025-09-07 07:07:53.76013+00
e72dbebc-95a4-4b60-87d6-f53a49995695	76559e26-3680-4e2f-a77e-dd47ba09a200	Janardhan Hebbar	male	1980-07-15 00:00:00+00	9845997857	Open Singles & Doubles	10 plus trophies in singles and doubles	f	\N	4654ff70-6b21-4fc4-b456-56a201b63535	200	200	t	2025-09-06 16:18:56.133407+00	2025-09-07 07:09:07.644951+00
6caf569c-15bf-4acf-85bb-86891d0872be	0f0c7eeb-9fea-4076-8897-ecb3370fae26	Manoj Bhat	male	1980-02-13 00:00:00+00	9886600620	Open Singles & Doubles	Played in habya and other local matches	f	\N	4654ff70-6b21-4fc4-b456-56a201b63535	200	1300	t	2025-09-06 16:18:56.136397+00	2025-09-07 07:12:47.764436+00
c780d7cb-dbc5-4a6f-a2e1-ebfa2d47460b	40f72840-b5ea-428b-80f0-e6dadd29518a	Vikas K Bhat	male	1987-05-31 00:00:00+00	9900443915	Men's Open Doubles	Semifinalist under 35+ in Habya 2025	f	\N	22fe2b64-e93d-44bc-8119-c6da9550653f	200	1200	t	2025-09-06 16:18:56.142259+00	2025-09-07 07:14:51.264519+00
02d8f384-c871-4e42-85e1-b19c747aa9f9	33b92894-cd7d-4b1b-8404-c1b06123f1a4	Shrivatsa Shankar Hegde	male	1999-11-25 00:00:00+00	9845837567	Open Singles & Doubles	Habya 1st round match won	f	\N	e69a7f4e-5088-4bc0-aa4d-3a8c7cb0a596	200	200	t	2025-09-06 16:18:56.159704+00	2025-09-07 07:20:56.220447+00
5a1c145c-fa8c-498e-882b-d1c267801ad9	68bd5725-aaa9-4a5d-a5e7-291fb5d751cc	Sachin Bhat	male	1996-04-14 00:00:00+00	9845823951	Men's Open Doubles	HBL 2023 Opens doubles winner	f	\N	22fe2b64-e93d-44bc-8119-c6da9550653f	200	400	t	2025-09-06 16:18:56.162525+00	2025-09-07 07:22:55.194601+00
39945d5b-93fd-4964-94da-1cd27c5d2430	3c91f794-2554-486f-b2a3-13cb8c1c720f	Anirudh Bhat	male	1996-04-22 00:00:00+00	9845074067	Men's Open Doubles	Represented VTU in the South Zones twice. Have won 50+ open tournaments.	f	\N	4654ff70-6b21-4fc4-b456-56a201b63535	200	3100	t	2025-09-06 16:18:56.165332+00	2025-09-07 07:28:17.662115+00
09ba483d-0754-4a78-848b-d82f6d920fec	ae65d90c-3806-4976-a404-05a5e26e7eda	Vinay Vidyadhar Hegde	male	1997-05-02 00:00:00+00	9740449462	Men's Open Doubles	Random double winner in habya 2024	f	\N	6d1ceb6e-113d-47a6-9d6f-34107f37131c	200	200	t	2025-09-06 16:18:56.168169+00	2025-09-07 07:30:52.257328+00
8b6bcc61-63e8-463e-995b-a3f3b527054b	92b801d5-1288-4b31-8a1c-b95ad856e8cc	Nahusha MS	male	1993-06-06 00:00:00+00	9740379533	Open Singles & Doubles	No. Beginner	f	\N	4654ff70-6b21-4fc4-b456-56a201b63535	200	600	t	2025-09-06 16:18:56.170947+00	2025-09-07 07:35:15.417733+00
5ad7dc66-71af-4805-9207-7f28849ac5fc	4cc177ab-68e9-489a-a33c-e0721bb15816	Arjuna Kote	male	2001-12-13 00:00:00+00	9611249996	Men's Open Doubles	Won in some family tournament	f	\N	e69a7f4e-5088-4bc0-aa4d-3a8c7cb0a596	200	200	t	2025-09-06 16:18:56.178627+00	2025-09-07 07:37:01.017192+00
6f1eae38-f956-4194-bf43-00608b075ad0	66bea8bd-8cb9-4f6a-862f-133fc9e10252	Sharath kumar	male	1992-03-18 00:00:00+00	9739964715	Men's Open Doubles	Participated in Habya and other tournaments in Bangalore	f	\N	e69a7f4e-5088-4bc0-aa4d-3a8c7cb0a596	200	200	t	2025-09-06 16:18:56.174686+00	2025-09-07 07:38:08.652636+00
c167479b-21eb-4946-bc4c-4ecfbfea0bcd	4be97015-54c0-41c3-88da-d95231d8c9f2	Amogh Bhat	male	2007-08-03 00:00:00+00	9591968519	Open Singles & Doubles	Intermediate	f	\N	dee0695f-dc4b-495a-a4e0-d1c2d113f720	200	1400	t	2025-09-06 16:18:56.181766+00	2025-09-07 07:44:15.650414+00
0a109afd-abaf-416a-94fc-3e84f1425ae0	25473b9f-4d45-4ff2-88f0-7eebe580ffeb	Bhargav satyanarayana hegde	male	1995-08-11 00:00:00+00	9591703732	Men's Open Doubles	None	f	\N	6d1ceb6e-113d-47a6-9d6f-34107f37131c	200	1200	t	2025-09-06 16:18:56.184707+00	2025-09-07 07:46:05.520926+00
f3cd8ad3-7299-49e4-a624-97fcc1a9353f	9a6068f1-ffc4-41f0-af0e-898cac8447ee	Arjun Vikram Hegde	male	2012-02-26 00:00:00+00	9886288101	Open Singles & Doubles	Intermediate level player	f	\N	6d1ceb6e-113d-47a6-9d6f-34107f37131c	200	200	t	2025-09-06 16:18:56.156811+00	2025-09-07 08:36:34.299216+00
5baaedbc-0091-4baa-b233-c931505cb9f6	cf9c6216-9373-4b11-80e3-ec51cab79d32	Rohith G M	male	1979-04-05 00:00:00+00	9448200121	Open Singles & Doubles	.	f	\N	dee0695f-dc4b-495a-a4e0-d1c2d113f720	200	200	t	2025-09-06 16:18:56.084049+00	2025-09-07 08:40:57.468835+00
f32b2e51-4e07-41ca-95d9-03e29e08ae36	2a6bd25b-c033-49b2-ae9d-fd6a73e4d6ff	Nagaraja H S	male	1980-07-28 00:00:00+00	9845795092	Open Singles & Doubles	Nothing ....!!!!	f	\N	e69a7f4e-5088-4bc0-aa4d-3a8c7cb0a596	200	200	t	2025-09-06 16:18:56.130629+00	2025-09-07 08:43:12.134532+00
fef0bf1e-7ad0-4cab-ad0d-e16b3fbca53c	575fc79c-4bf9-4cca-895f-ae19e81370c2	ARUNA G	male	1968-03-17 00:00:00+00	9480214466	Men's Open Doubles	7 cups in 8 years of habya	f	\N	dee0695f-dc4b-495a-a4e0-d1c2d113f720	200	200	t	2025-09-06 16:18:56.098539+00	2025-09-07 09:48:00.096104+00
7007f627-3389-4925-96a3-70f450f5dea5	808d5420-0fa2-4fc2-83c1-3229d457e9a4	Vinay Shreepati Kodsar	male	1992-05-03 00:00:00+00	9591101778	Open Singles & Doubles	Quater Finalists in Karnataka State Corporate Badminton Tournament.	f	\N	\N	200	200	f	2025-09-06 16:18:56.190423+00	2025-09-06 16:18:56.190423+00
0de22d9f-8e1e-462c-997c-3350e266b8c1	71bf7e9c-95e9-46c5-b0a3-43177f320a51	GANESH NAGAPATI HEGDE	male	1995-08-24 00:00:00+00	9482015486	Men's Open Doubles	Nil	f	\N	\N	200	200	f	2025-09-06 16:18:56.206616+00	2025-09-06 16:18:56.206616+00
172bde80-be4d-4bcd-ab56-ded7130de63b	d3878244-4e83-49c6-8951-4f237f3851ed	Abhishek Bhat	male	1991-08-04 00:00:00+00	9481460801	Men's Open Doubles	Have played habya 2025	f	\N	\N	200	200	f	2025-09-06 16:18:56.215629+00	2025-09-06 16:18:56.215629+00
a8993e21-c965-49c7-8302-c3bd98837b7e	e8e2f7a1-b690-4f42-8a8b-d4740295961a	Pruthviraj Raveesh Bhat	male	2006-05-18 00:00:00+00	9110222042	Open Singles & Doubles	.	f	\N	\N	200	200	f	2025-09-06 16:18:56.225457+00	2025-09-06 16:18:56.225457+00
9a7d39b0-7cf2-4df1-85df-910808c29e5e	fdde2ddb-2bcb-4eeb-820b-0ee7b36f2356	Narayan G Hegde	male	1998-12-09 00:00:00+00	8971574041	Men's Open Doubles	.	f	\N	\N	200	200	f	2025-09-06 16:18:56.237298+00	2025-09-06 16:18:56.237298+00
1acd0314-d983-4539-a504-64bd333832c7	225c7745-67e4-4684-884f-659260fec528	Lokesh Shreedar Hebbar	male	1991-12-20 00:00:00+00	8971172922	Men's Open Doubles	Runner up in small tournament	f	\N	\N	200	200	f	2025-09-06 16:18:56.243724+00	2025-09-06 16:18:56.243724+00
a15eb90c-c2d8-4b8a-81a4-691e0ea8bc8f	c7b64bbb-a1ab-466f-bbfe-aba26752c9c9	Gowtham avabhrath	male	2007-10-21 00:00:00+00	8660315119	Men's Open Singles	Participated in Abhay tournament.\nParticipated in district level pu section tournament	f	\N	\N	200	200	f	2025-09-06 16:18:56.252261+00	2025-09-06 16:18:56.252261+00
10eb6ce4-2519-4c6f-a3c0-9ec96687d9f0	dd57590a-4d1f-4cba-8f27-5ca9a3b00a4d	Shripati Bhat	male	1994-01-29 00:00:00+00	8277454723	Men's Open Doubles	Regular participant in Habya and an active weekend player, demonstrating consistent passion and dedication to the sport.	f	\N	\N	200	200	f	2025-09-06 16:18:56.269202+00	2025-09-06 16:18:56.269202+00
7b6c8fac-15a3-4c00-8737-dc9af957069a	9195bb8f-c888-402e-b4be-2391e9750746	Prasann Hegde	male	1994-01-05 00:00:00+00	8277226589	Men's Open Doubles	Intermediate	f	\N	\N	200	200	f	2025-09-06 16:18:56.272264+00	2025-09-06 16:18:56.272264+00
4c9e9529-7d39-4245-8be8-666c753c33ad	f0b95883-ebcb-4ff2-86b4-97f91bab799c	Gurudarshan Ganapati hegde	male	1992-07-16 00:00:00+00	8277090355	Men's Open Doubles	Having 2.5 years daily play experience.	f	\N	\N	200	200	f	2025-09-06 16:18:56.27643+00	2025-09-06 16:18:56.27643+00
580ba5b5-7af5-4e17-8879-14f0691cebf4	bb5ad355-36f0-4c5c-8b2f-79d716e15c63	Raveesh Hegde	male	1993-10-06 00:00:00+00	8277089321	Men's Open Doubles	Nothing	f	\N	\N	200	200	f	2025-09-06 16:18:56.279756+00	2025-09-06 16:18:56.279756+00
9ce4406e-60e6-4f00-a008-6f34c62d5a02	a6d6d2d8-4a6d-4771-b744-a48bbabc5219	Vinod Kumar N	male	1995-04-05 00:00:00+00	8197496787	Men's Open Doubles	Reached semifinals in Mangalore Havyaka Tournament	f	\N	\N	200	200	f	2025-09-06 16:18:56.282776+00	2025-09-06 16:18:56.282776+00
a3ab9317-20a8-440d-bb76-6279695a68ed	47050e5c-d64b-4640-b4c4-97812094ce82	Ashwath Hegde	male	1999-10-05 00:00:00+00	8105297812	Open Singles & Doubles	Nothing much! I'm an intermediate++ (In the real world level) who plays regularly in Bengaluru.	f	\N	\N	200	200	f	2025-09-06 16:18:56.289127+00	2025-09-06 16:18:56.289127+00
3fba92be-4256-4162-82b1-681a403b2a3e	50d874bb-12a9-4055-ab64-ab523af1b1aa	Pavan Vinayak Bhat	male	1995-05-04 00:00:00+00	7795408848	Open Singles & Doubles	Intermediate Player	f	\N	\N	200	200	f	2025-09-06 16:18:56.294838+00	2025-09-06 16:18:56.294838+00
5fcc6f6b-e466-45b5-a939-0ade5ea9f87e	f8daa86e-2c9a-45c4-955e-c030de293b19	Shrinidhi S	male	1990-10-27 00:00:00+00	9483975343	Open Singles & Doubles	None	f	\N	22fe2b64-e93d-44bc-8119-c6da9550653f	200	200	t	2025-09-06 16:18:56.200194+00	2025-09-07 07:52:21.300937+00
73b668d4-d845-4679-a81f-dcd70ae65150	46576f2a-db4e-4c3f-9da8-4380712ecfda	Sandesh Hemadri	male	1997-06-06 00:00:00+00	9483864047	Men's Open Doubles	University Blue - BVB college	f	\N	22fe2b64-e93d-44bc-8119-c6da9550653f	200	2000	t	2025-09-06 16:18:56.203367+00	2025-09-07 07:57:58.914325+00
c3c58803-279f-4bc3-8c33-5bb80a56cf8e	2dad1b30-944b-4198-aed2-57751b645695	Nishant N Hegde	male	2005-03-01 00:00:00+00	9480306549	Men's Open Doubles	I have won 2 state level tournament couple to opens and i have been state lvl player	f	\N	6d1ceb6e-113d-47a6-9d6f-34107f37131c	200	300	t	2025-09-06 16:18:56.218569+00	2025-09-07 08:02:42.324608+00
85e3e393-1144-40fe-a1f8-42e8ad7b049a	fc726a07-35fe-4cf8-9039-fd6f83005ac7	Keshava Prasanna M	male	1999-05-28 00:00:00+00	9108132887	Open Singles & Doubles	Nil	f	\N	22fe2b64-e93d-44bc-8119-c6da9550653f	200	500	t	2025-09-06 16:18:56.22831+00	2025-09-07 08:07:09.002143+00
70e656fd-8146-4ac4-98f6-4ecee5a78761	decf4b25-f3e6-4aab-990b-60e60dc2acdc	Manojava Bhat	male	2001-08-20 00:00:00+00	8792763849	Men's Open Doubles	.	f	\N	e69a7f4e-5088-4bc0-aa4d-3a8c7cb0a596	200	400	t	2025-09-06 16:18:56.24942+00	2025-09-07 08:15:00.392786+00
a3ffe157-c221-4e4f-8dc1-6733693aa9e6	66fe871b-bae7-4514-b151-b8d066d49cfc	Kartik Vinayak Bhat	male	1999-09-08 00:00:00+00	8431310315	Men's Open Doubles	Havyaka badminton tournament men’s doubles 1 time champion and 1 time runner up. Also several tournament winner and runner up in Mixed and men’s doubles in Germany.	f	\N	dee0695f-dc4b-495a-a4e0-d1c2d113f720	200	1200	t	2025-09-06 16:18:56.256365+00	2025-09-07 08:20:09.800307+00
8aa7c350-07a7-4319-bcf2-a279b5f282fb	3062573c-4b77-4db0-b684-25f09213bf5c	Tushar K Raysad	male	1997-08-19 00:00:00+00	8277741621	Open Singles & Doubles	Won Open doubles trophy at HPL for last two years.	f	\N	22fe2b64-e93d-44bc-8119-c6da9550653f	200	1600	t	2025-09-06 16:18:56.262495+00	2025-09-07 08:24:11.185356+00
696a81d8-4a21-4c15-afd7-837fa82a608c	fcf359df-b266-4886-bfda-701b16dd86c1	S Manoj	male	1998-08-22 00:00:00+00	8123505907	Open Singles & Doubles	Habya Unseeded Winner 2024	f	\N	e69a7f4e-5088-4bc0-aa4d-3a8c7cb0a596	200	1300	t	2025-09-06 16:18:56.286299+00	2025-09-07 08:28:20.24033+00
ef224298-b904-4525-a92c-4d8202b94662	cb772e00-b8cf-4ddd-ae1f-b65921d82be0	Samith Hegde	male	2008-12-15 00:00:00+00	7975218059	Open Singles & Doubles	CBSE South Zone 2024-25 U-17 Boys Silver Medalist, Habya 2025 Open Men's Doubles Runner-up, Feathers cup 2025 U-17 boys singles winner, Padukone Sports Management open Junior boys doubles U-15 Runner-up, Wings of Fire State open U-17 Boys singles Runner up and Doubles winner, Golden Point Karnataka State open 2022 U-17 Mixed Doubles Winners...	f	\N	6d1ceb6e-113d-47a6-9d6f-34107f37131c	200	2400	t	2025-09-06 16:18:56.29185+00	2025-09-07 08:30:22.064088+00
4ee01118-75b2-482a-918e-82de98b1392b	45d64cf1-69f9-4f19-90c3-c7e227c446d7	Darshan R Bhat	male	2001-08-03 00:00:00+00	9481461402	Men's Open Doubles	Na	f	\N	dee0695f-dc4b-495a-a4e0-d1c2d113f720	200	400	t	2025-09-06 16:18:56.212408+00	2025-09-07 08:38:07.444829+00
8ce73e9f-f2b0-4aad-860b-18f4066e3430	7a01ec3d-9084-4859-a087-2bc948bd61c0	Shreeharsha Hegde	male	1993-04-28 00:00:00+00	8971404578	Men's Open Doubles	Playing badminton from last 15 years\nExperience of playing many tournaments\nWon few tournaments as well	f	\N	4654ff70-6b21-4fc4-b456-56a201b63535	200	200	t	2025-09-06 16:18:56.240195+00	2025-09-07 08:39:06.659353+00
d610b077-065b-4607-9a24-076f271f384f	d0452b3e-8a66-47d4-acc7-c33fe2126dbf	Vasuki Abhaya Sharma	male	2008-03-14 00:00:00+00	9008913700	Open Singles & Doubles	Beginner	f	\N	4654ff70-6b21-4fc4-b456-56a201b63535	200	200	t	2025-09-06 16:18:56.234496+00	2025-09-07 08:39:40.129049+00
6258b0cc-5fc4-4735-899b-76617fe24f5c	fe10cf87-925e-41ec-bbda-0b2ba75d0b40	Shriram Vinayak Bhat	male	2001-08-27 00:00:00+00	8431310315	Men's Open Doubles	Advance level player.\nPlayed last 2 HBL tournaments.\nPlayed Habya tournaments and other tournaments.	f	\N	dee0695f-dc4b-495a-a4e0-d1c2d113f720	200	800	t	2025-09-06 16:18:56.259826+00	2025-09-07 08:42:18.459693+00
e293de1f-9604-4ec1-b421-8149990fe250	cf4d9389-6ed0-4272-962c-71a87b40ade8	P Nagaraja Sharma	male	2000-05-01 00:00:00+00	8277549234	Men's Open Doubles	Nothing	f	\N	dee0695f-dc4b-495a-a4e0-d1c2d113f720	200	200	t	2025-09-06 16:18:56.26566+00	2025-09-07 08:44:40.539021+00
765c3464-68fc-4d95-9f43-fe241611743f	41b182e6-d2e1-41f2-803c-fa7b43b94c48	Anoop Vinayak Hegde	male	2011-02-14 00:00:00+00	9481627942	Open Singles & Doubles	Badminton has seen impressive achievements, including Olympic Medal,World Championship titles,and recognition as an official olympic sport	f	\N	6d1ceb6e-113d-47a6-9d6f-34107f37131c	200	200	t	2025-09-06 16:18:56.209308+00	2025-09-07 09:41:17.436951+00
fbfe3633-040b-4536-9026-df3f631ed554	5c6b06f8-0340-4387-b1fc-aed5894dd6d5	Adithya Kote	male	1993-09-24 00:00:00+00	8970633891	Men's Open Doubles	Open categories	f	\N	4654ff70-6b21-4fc4-b456-56a201b63535	200	200	t	2025-09-06 16:18:56.246559+00	2025-09-07 09:47:39.39728+00
b008672f-50f9-434e-a17d-3c5e37804a5b	1ade140e-bda8-4cb4-8322-f0572b6a40d0	Ganeshmurthy Hegde	male	1993-07-24 00:00:00+00	9035033030	Open Singles & Doubles	Rated Advanced in playo and played 4 to 5 tournaments so far	f	\N	6d1ceb6e-113d-47a6-9d6f-34107f37131c	200	200	t	2025-09-06 16:18:56.231134+00	2025-09-07 09:49:23.516255+00
bb4b4123-418b-4e61-89e8-4be52997840f	50207edc-385b-4075-877a-2918ff1c046d	Abhishek H K	male	1993-11-16 00:00:00+00		Open Singles & Doubles	Retained player	t	22fe2b64-e93d-44bc-8119-c6da9550653f	22fe2b64-e93d-44bc-8119-c6da9550653f	2500	2500	t	2025-09-06 16:19:44.574589+00	2025-09-06 16:19:44.574589+00
b5c35a11-7170-447b-9b14-60c1f002505e	1fab6a26-3b6f-40f9-a86a-ed46163ea398	Murali Hegde	male	1998-09-04 00:00:00+00		Open Singles & Doubles	Retained player	t	22fe2b64-e93d-44bc-8119-c6da9550653f	22fe2b64-e93d-44bc-8119-c6da9550653f	2500	2500	t	2025-09-06 16:19:44.581944+00	2025-09-06 16:19:44.581944+00
a448d9f0-02e4-432e-bf5b-971739a01dc3	5a7405d7-a26b-4b7f-9a4b-54a0fb6d0ffe	Manjunath Rao	male	1983-04-23 00:00:00+00		Open Singles & Doubles	Retained player	t	22fe2b64-e93d-44bc-8119-c6da9550653f	22fe2b64-e93d-44bc-8119-c6da9550653f	2500	2500	t	2025-09-06 16:19:44.587806+00	2025-09-06 16:19:44.587806+00
730609c3-3148-4e35-a74b-812e23aa7ebe	2caf3a5d-1436-491e-92f8-a5a67616152f	Niranjan Ganapati Hegde	male	1987-05-14 00:00:00+00		Open Singles & Doubles	Retained player	t	22fe2b64-e93d-44bc-8119-c6da9550653f	22fe2b64-e93d-44bc-8119-c6da9550653f	2500	2500	t	2025-09-06 16:19:44.593418+00	2025-09-06 16:19:44.593418+00
9c5dd795-2913-4eee-9fe2-8adf23a84de5	ba6281d0-b1ea-4cb7-89ff-8a146f288460	Satvik Bhat	male	2002-03-22 00:00:00+00		Open Singles & Doubles	Retained player	t	4654ff70-6b21-4fc4-b456-56a201b63535	4654ff70-6b21-4fc4-b456-56a201b63535	2500	2500	t	2025-09-06 16:19:44.603886+00	2025-09-06 16:19:44.603886+00
e931fd08-e765-41d9-b87a-e185481706a3	bd016887-6f91-4aaf-8abf-04ecda8c6c6f	Akhil Hegde	male	2006-07-29 00:00:00+00		Open Singles & Doubles	Retained player	t	4654ff70-6b21-4fc4-b456-56a201b63535	4654ff70-6b21-4fc4-b456-56a201b63535	2500	2500	t	2025-09-06 16:19:44.609368+00	2025-09-06 16:19:44.609368+00
80ac0613-e02f-4eca-b900-269ed47b09d9	d68e77f0-2e74-4da9-8064-38bd88307bfb	Varsha Vineeth Bhat	female	2003-09-13 00:00:00+00		Open Singles & Doubles	Retained player	t	4654ff70-6b21-4fc4-b456-56a201b63535	4654ff70-6b21-4fc4-b456-56a201b63535	2500	2500	t	2025-09-06 16:19:44.614661+00	2025-09-06 16:19:44.614661+00
b00c83ab-f60f-453f-8315-33e289164562	5769845e-729c-43fc-bf48-ebdf289adb9f	Nandakishore.B	male	1981-05-19 00:00:00+00		Open Singles & Doubles	Retained player	t	4654ff70-6b21-4fc4-b456-56a201b63535	4654ff70-6b21-4fc4-b456-56a201b63535	2500	2500	t	2025-09-06 16:19:44.619777+00	2025-09-06 16:19:44.619777+00
49b6fc55-9636-494a-bc8c-83550029276c	3c2f5517-9c32-4ce2-98ce-66af466b4cee	Praveen Bhat	male	1993-07-25 00:00:00+00		Open Singles & Doubles	Retained player	t	e69a7f4e-5088-4bc0-aa4d-3a8c7cb0a596	e69a7f4e-5088-4bc0-aa4d-3a8c7cb0a596	2500	2500	t	2025-09-06 16:19:44.629328+00	2025-09-06 16:19:44.629329+00
008ae9d6-4142-4fac-8e92-d42baa76feae	24d5d271-6a81-40a8-a5f4-9f82f0091180	Kiran J Bhat	male	1994-10-23 00:00:00+00		Open Singles & Doubles	Retained player	t	e69a7f4e-5088-4bc0-aa4d-3a8c7cb0a596	e69a7f4e-5088-4bc0-aa4d-3a8c7cb0a596	2500	2500	t	2025-09-06 16:19:44.634215+00	2025-09-06 16:19:44.634215+00
82555e84-a2e2-4afb-95c8-a32566ac63aa	3d1c73f9-ec33-4c6d-9725-865fedc4059a	Prasanna HJ	male	1996-06-22 00:00:00+00		Open Singles & Doubles	Retained player	t	e69a7f4e-5088-4bc0-aa4d-3a8c7cb0a596	e69a7f4e-5088-4bc0-aa4d-3a8c7cb0a596	2500	2500	t	2025-09-06 16:19:44.63891+00	2025-09-06 16:19:44.638911+00
9e79c284-d0a6-46d3-8d3a-51e5f34d4c4c	ef67fbd3-3ba2-4a70-b44f-4ba8de1936d4	Pradeep Kumar P	male	1983-03-06 00:00:00+00		Open Singles & Doubles	Retained player	t	e69a7f4e-5088-4bc0-aa4d-3a8c7cb0a596	e69a7f4e-5088-4bc0-aa4d-3a8c7cb0a596	2500	2500	t	2025-09-06 16:19:44.643631+00	2025-09-06 16:19:44.643631+00
11de40cc-7682-41d4-9d4a-8870528d629f	0fec4065-eae7-49d7-a928-f4c7b8fdf31f	Gururaj Hegde	male	1996-06-06 00:00:00+00		Open Singles & Doubles	Retained player	t	dee0695f-dc4b-495a-a4e0-d1c2d113f720	dee0695f-dc4b-495a-a4e0-d1c2d113f720	2500	2500	t	2025-09-06 16:19:44.655872+00	2025-09-06 16:19:44.655872+00
3e038f91-d1a9-4843-bcbd-6f5094402a7b	af0b0617-15f4-4030-925c-8dee316abd18	Ashwini Kumar Bhat	male	1983-07-21 00:00:00+00		Open Singles & Doubles	Retained player	t	dee0695f-dc4b-495a-a4e0-d1c2d113f720	dee0695f-dc4b-495a-a4e0-d1c2d113f720	2500	2500	t	2025-09-06 16:19:44.660569+00	2025-09-06 16:19:44.660569+00
79a65c4d-48d6-401b-9153-31529fae9ce5	ea2fa9f3-6146-4d46-bc0c-ca19bd2cb561	Prajwal G Bhat	male	2006-07-29 00:00:00+00		Open Singles & Doubles	Retained player	t	dee0695f-dc4b-495a-a4e0-d1c2d113f720	dee0695f-dc4b-495a-a4e0-d1c2d113f720	2500	2500	t	2025-09-06 16:19:44.665238+00	2025-09-06 16:19:44.665238+00
096f650a-2bd8-4ab5-8001-f692cb3bc085	f11c17b2-e93a-4fcb-99d8-77f9aca4aa6f	Dr Dinesh R Hegde	male	1969-08-28 00:00:00+00		Open Singles & Doubles	Retained player	t	dee0695f-dc4b-495a-a4e0-d1c2d113f720	dee0695f-dc4b-495a-a4e0-d1c2d113f720	2500	2500	t	2025-09-06 16:19:44.669928+00	2025-09-06 16:19:44.669929+00
04332939-4e05-4391-bf33-730c72149bb8	a32a5706-37b9-4dfa-a29c-2bafc502c5ea	Twisha Hegde	female	2010-11-29 00:00:00+00		Open Singles & Doubles	Retained player	t	6d1ceb6e-113d-47a6-9d6f-34107f37131c	6d1ceb6e-113d-47a6-9d6f-34107f37131c	2500	2500	t	2025-09-06 16:19:44.679039+00	2025-09-06 16:19:44.679039+00
a8a296eb-692e-4a85-b5e2-0b19f6609e6f	624e569a-8c58-489b-b342-40ce0cb94cb5	Digant Hegde	male	2009-09-27 00:00:00+00		Open Singles & Doubles	Retained player	t	6d1ceb6e-113d-47a6-9d6f-34107f37131c	6d1ceb6e-113d-47a6-9d6f-34107f37131c	2500	2500	t	2025-09-06 16:19:44.685506+00	2025-09-06 16:19:44.685506+00
0dbd813e-40d4-487a-a96d-918bc90d9a70	dc655775-d1d8-46b0-8d73-223d7b2af0ba	Shreyas Kumar M	male	1980-02-14 00:00:00+00		Open Singles & Doubles	Retained player	t	6d1ceb6e-113d-47a6-9d6f-34107f37131c	6d1ceb6e-113d-47a6-9d6f-34107f37131c	2500	2500	t	2025-09-06 16:19:44.693196+00	2025-09-06 16:19:44.693196+00
3b16d47b-8d52-48f9-88c5-63a9d4385831	e672843d-8534-4095-93ea-e49cf616b2f9	Surendra Radhakrishna Hegde	male	2001-08-08 00:00:00+00		Open Singles & Doubles	Retained player	t	6d1ceb6e-113d-47a6-9d6f-34107f37131c	6d1ceb6e-113d-47a6-9d6f-34107f37131c	2500	2500	t	2025-09-06 16:19:44.69911+00	2025-09-06 16:19:44.69911+00
faf752cf-88d8-429c-8f1d-22241f7c0bc2	5babfbcd-057d-41f3-acce-d3cc33ba0a46	Deepak G Hegde	male	2000-06-12 00:00:00+00	9513086359	Open Singles & Doubles	Represented sirsi in State level tournment in 2019	f	\N	e69a7f4e-5088-4bc0-aa4d-3a8c7cb0a596	200	200	t	2025-09-06 16:18:56.19739+00	2025-09-07 07:53:35.656542+00
fcf7cb86-8c21-433f-83c8-3e342386f621	f424c699-5b64-4898-b43d-970f867a5656	Karthik Shripad Hegde	male	2000-04-17 00:00:00+00	9380555188	Open Singles & Doubles	University Blue 2019, National reserve in college sports 2017, Main draws in u-19 singles state ranking (2017), Habya winner in mixed age doubles 2 times & Runner up in open doubles and mixed age doubles. Winner/runner in state open tournaments  (former)	f	\N	6d1ceb6e-113d-47a6-9d6f-34107f37131c	200	1600	t	2025-09-06 16:18:56.221311+00	2025-09-07 08:05:21.152143+00
c40da93a-5e66-401a-857b-bbeb0cd670bf	5e39e95d-4241-4413-9b9d-745f562235f4	Suhaschandra S Hegde	male	2002-09-21 00:00:00+00	7619373369	Open Singles & Doubles	Participated in HABYA 2023 in Bangalore	f	\N	6d1ceb6e-113d-47a6-9d6f-34107f37131c	200	200	t	2025-09-06 16:18:56.297945+00	2025-09-07 08:31:30.733842+00
b61e7a2c-0901-4a88-8201-2aeb0c78e164	cfcb96ce-dc91-41b6-bd2c-90d795f9bccb	Mahabaleshwara sharma	male	2004-09-09 00:00:00+00	7204925119	Open Singles & Doubles	Inter	f	\N	dee0695f-dc4b-495a-a4e0-d1c2d113f720	200	200	t	2025-09-06 16:18:56.300949+00	2025-09-07 08:32:16.703518+00
\.


--
-- Data for Name: retained_players; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.retained_players (id, player_id, team_id, created_at, updated_at) FROM stdin;
043ba0c1-a0d1-4b6f-bf17-4d5e60cdd262	bb4b4123-418b-4e61-89e8-4be52997840f	22fe2b64-e93d-44bc-8119-c6da9550653f	2025-09-06 16:19:44.576685+00	2025-09-06 16:19:44.576685+00
5b7b233b-f305-47df-84f4-52eceac91258	b5c35a11-7170-447b-9b14-60c1f002505e	22fe2b64-e93d-44bc-8119-c6da9550653f	2025-09-06 16:19:44.583729+00	2025-09-06 16:19:44.583729+00
19a61edc-8d6b-481c-856f-598fa55bbb9a	a448d9f0-02e4-432e-bf5b-971739a01dc3	22fe2b64-e93d-44bc-8119-c6da9550653f	2025-09-06 16:19:44.589543+00	2025-09-06 16:19:44.589543+00
7c7ddc21-c64f-44ae-bfd5-54bb0451986c	730609c3-3148-4e35-a74b-812e23aa7ebe	22fe2b64-e93d-44bc-8119-c6da9550653f	2025-09-06 16:19:44.595237+00	2025-09-06 16:19:44.595237+00
77d2c7da-143e-41b1-afb8-62e1612c5a68	9c5dd795-2913-4eee-9fe2-8adf23a84de5	4654ff70-6b21-4fc4-b456-56a201b63535	2025-09-06 16:19:44.60552+00	2025-09-06 16:19:44.60552+00
8935804e-61c0-4061-bdd5-f6981853bb2e	e931fd08-e765-41d9-b87a-e185481706a3	4654ff70-6b21-4fc4-b456-56a201b63535	2025-09-06 16:19:44.610995+00	2025-09-06 16:19:44.610995+00
86e1726a-3951-47f8-b6f9-e6d5637e25b6	80ac0613-e02f-4eca-b900-269ed47b09d9	4654ff70-6b21-4fc4-b456-56a201b63535	2025-09-06 16:19:44.616463+00	2025-09-06 16:19:44.616463+00
3cc30ff1-068e-4ee4-9925-bc84dab22c46	b00c83ab-f60f-453f-8315-33e289164562	4654ff70-6b21-4fc4-b456-56a201b63535	2025-09-06 16:19:44.62128+00	2025-09-06 16:19:44.62128+00
8b52e2ce-9224-4cd6-8c7c-acbd9865d2d7	49b6fc55-9636-494a-bc8c-83550029276c	e69a7f4e-5088-4bc0-aa4d-3a8c7cb0a596	2025-09-06 16:19:44.630797+00	2025-09-06 16:19:44.630797+00
a95be748-367f-4175-93f5-70e84f8df5c4	008ae9d6-4142-4fac-8e92-d42baa76feae	e69a7f4e-5088-4bc0-aa4d-3a8c7cb0a596	2025-09-06 16:19:44.635635+00	2025-09-06 16:19:44.635635+00
75eea830-f98b-421a-8c81-9eb6ab99d2e3	82555e84-a2e2-4afb-95c8-a32566ac63aa	e69a7f4e-5088-4bc0-aa4d-3a8c7cb0a596	2025-09-06 16:19:44.640335+00	2025-09-06 16:19:44.640335+00
c1dbf1fb-d66a-4400-8340-237a7c99032c	9e79c284-d0a6-46d3-8d3a-51e5f34d4c4c	e69a7f4e-5088-4bc0-aa4d-3a8c7cb0a596	2025-09-06 16:19:44.645038+00	2025-09-06 16:19:44.645039+00
39ac6b1e-f7f0-4edf-b11a-69ec870cc1f9	11de40cc-7682-41d4-9d4a-8870528d629f	dee0695f-dc4b-495a-a4e0-d1c2d113f720	2025-09-06 16:19:44.657358+00	2025-09-06 16:19:44.657358+00
c30f3d5b-51c5-48cb-96ec-1ec84a7c73ba	3e038f91-d1a9-4843-bcbd-6f5094402a7b	dee0695f-dc4b-495a-a4e0-d1c2d113f720	2025-09-06 16:19:44.661953+00	2025-09-06 16:19:44.661953+00
4f9f2ad0-226f-4fa1-aa47-f129017e8d2d	79a65c4d-48d6-401b-9153-31529fae9ce5	dee0695f-dc4b-495a-a4e0-d1c2d113f720	2025-09-06 16:19:44.666652+00	2025-09-06 16:19:44.666652+00
6d4ed2a7-5e49-4817-bbef-f0ad8561e9a6	096f650a-2bd8-4ab5-8001-f692cb3bc085	dee0695f-dc4b-495a-a4e0-d1c2d113f720	2025-09-06 16:19:44.671398+00	2025-09-06 16:19:44.671398+00
0b83ee98-4346-46a0-a612-8bcf616e8173	04332939-4e05-4391-bf33-730c72149bb8	6d1ceb6e-113d-47a6-9d6f-34107f37131c	2025-09-06 16:19:44.680776+00	2025-09-06 16:19:44.680776+00
cc17acbf-fa0a-42d6-9286-fb753dd3e4dd	a8a296eb-692e-4a85-b5e2-0b19f6609e6f	6d1ceb6e-113d-47a6-9d6f-34107f37131c	2025-09-06 16:19:44.687496+00	2025-09-06 16:19:44.687496+00
608b8400-861f-46d7-9b6c-aa4b35e7ee74	0dbd813e-40d4-487a-a96d-918bc90d9a70	6d1ceb6e-113d-47a6-9d6f-34107f37131c	2025-09-06 16:19:44.694891+00	2025-09-06 16:19:44.694891+00
edd21f70-33e6-4b3d-abfd-7234ed988c29	3b16d47b-8d52-48f9-88c5-63a9d4385831	6d1ceb6e-113d-47a6-9d6f-34107f37131c	2025-09-06 16:19:44.700768+00	2025-09-06 16:19:44.700768+00
\.


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teams (id, name, total_points, used_points, player_count, min_players, max_players, created_at, updated_at) FROM stdin;
e69a7f4e-5088-4bc0-aa4d-3a8c7cb0a596	ROARING LIONS	20000	20000	17	14	20	2025-09-06 16:19:44.624578+00	2025-09-07 08:43:12.135243+00
4654ff70-6b21-4fc4-b456-56a201b63535	RACQUET RENEGADES	20000	19700	16	14	20	2025-09-06 16:19:44.598917+00	2025-09-07 09:47:39.397693+00
dee0695f-dc4b-495a-a4e0-d1c2d113f720	TEAM G	20000	19300	17	14	20	2025-09-06 16:19:44.648085+00	2025-09-07 09:48:00.096495+00
6d1ceb6e-113d-47a6-9d6f-34107f37131c	TEAM INSPIRE	20000	19900	21	14	20	2025-09-06 16:19:44.674473+00	2025-09-07 09:49:23.516609+00
22fe2b64-e93d-44bc-8119-c6da9550653f	PHOENIX SMASHERS	20000	18500	15	14	20	2025-09-06 16:19:44.567673+00	2025-09-07 08:24:11.185901+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password, role, team_id, created_at, updated_at) FROM stdin;
9d887947-574e-4b32-8f5f-e2efdea59ef3	charvi.ganesh	charvi.ganesh@player.com	player123	player	\N	2025-09-06 16:18:56.022025+00	2025-09-06 16:18:56.022025+00
d1b9c4ec-2d83-4c97-8938-74b866d2f5cb	rachana.shegde	rachana.shegde@player.com	player123	player	\N	2025-09-06 16:18:56.026323+00	2025-09-06 16:18:56.026323+00
0d2f15a3-191c-48dd-a253-d8cb6dee2cad	manvi.hebbar	manvi.hebbar@player.com	player123	player	\N	2025-09-06 16:18:56.029848+00	2025-09-06 16:18:56.029848+00
651af16a-38a4-4b34-b0b5-4bfe31753510	vibhava.kr	vibhava.kr@player.com	player123	player	\N	2025-09-06 16:18:56.033348+00	2025-09-06 16:18:56.033348+00
d0e4469a-8f05-47f4-8be3-edd1b9bf4518	avani.anil...bhat	avani.anil...bhat@player.com	player123	player	\N	2025-09-06 16:18:56.036642+00	2025-09-06 16:18:56.036642+00
77a37a63-0a6c-43c4-b6fa-f7d5c7f82383	krutika.hegde	krutika.hegde@player.com	player123	player	\N	2025-09-06 16:18:56.040129+00	2025-09-06 16:18:56.040129+00
8daa78d9-181b-49fd-b8d0-ccc0e6c98856	dishalakshmi.r.bhat	dishalakshmi.r.bhat@player.com	player123	player	\N	2025-09-06 16:18:56.043449+00	2025-09-06 16:18:56.043449+00
2043537f-9c24-486f-9d4e-e7971dfa635c	sugandhi.s	sugandhi.s@player.com	player123	player	\N	2025-09-06 16:18:56.046387+00	2025-09-06 16:18:56.046387+00
0ac748bd-8c1d-4846-ba1f-52021a263a84	deepika.hegde	deepika.hegde@player.com	player123	player	\N	2025-09-06 16:18:56.049461+00	2025-09-06 16:18:56.049461+00
34a9e4e5-1246-45c3-a98f-864ed3b3cbd6	raghavendra.hegde	raghavendra.hegde@player.com	player123	player	\N	2025-09-06 16:18:56.052712+00	2025-09-06 16:18:56.052712+00
26a964b6-ca8a-4d0c-82fa-d83d0954cb57	shrivathsa.d.n	shrivathsa.d.n@player.com	player123	player	\N	2025-09-06 16:18:56.055746+00	2025-09-06 16:18:56.055746+00
01ca34ac-3d38-49e1-b496-55b31af3be01	hariprasad.hegde	hariprasad.hegde@player.com	player123	player	\N	2025-09-06 16:18:56.058774+00	2025-09-06 16:18:56.058774+00
45d24ce0-9a63-4bc9-b15f-fdcbb56fb8b7	prakasha.mahabaleshwara.hegade	prakasha.mahabaleshwara.hegade@player.com	player123	player	\N	2025-09-06 16:18:56.061983+00	2025-09-06 16:18:56.061983+00
ca3ca2c8-6c5d-4c01-be6b-001f4fd5296c	shishira.kv	shishira.kv@player.com	player123	player	\N	2025-09-06 16:18:56.064923+00	2025-09-06 16:18:56.064923+00
e3202d49-6cee-46ed-b59c-f533a0038b51	sandeshkumar.hk	sandeshkumar.hk@player.com	player123	player	\N	2025-09-06 16:18:56.06784+00	2025-09-06 16:18:56.06784+00
570b85cf-95cc-4114-94ba-a25fceae42cf	dileep.laxminarayan.bhat	dileep.laxminarayan.bhat@player.com	player123	player	\N	2025-09-06 16:18:56.070847+00	2025-09-06 16:18:56.070847+00
e9203cf7-5add-4b15-8faa-41a43da91178	rameshramakrishna.hegde	rameshramakrishna.hegde@player.com	player123	player	\N	2025-09-06 16:18:56.073905+00	2025-09-06 16:18:56.073905+00
d01ff03d-8dae-47ff-ad5e-be029671186b	vikram.hegde	vikram.hegde@player.com	player123	player	\N	2025-09-06 16:18:56.076962+00	2025-09-06 16:18:56.076962+00
f5706418-cbab-4c72-8ec8-5a60f6beb081	narasimha.narayan.hegde	narasimha.narayan.hegde@player.com	player123	player	\N	2025-09-06 16:18:56.079994+00	2025-09-06 16:18:56.079994+00
cf9c6216-9373-4b11-80e3-ec51cab79d32	rohithg.m	rohithg.m@player.com	player123	player	\N	2025-09-06 16:18:56.082829+00	2025-09-06 16:18:56.082829+00
ba129c5b-a835-4fd6-b4da-2c746ea72ac9	raghavendra.m.s	raghavendra.m.s@player.com	player123	player	\N	2025-09-06 16:18:56.085848+00	2025-09-06 16:18:56.085848+00
a2cb5600-d0cb-4d6f-8e90-deb3c38adac9	gangadhar.c.hegde	gangadhar.c.hegde@player.com	player123	player	\N	2025-09-06 16:18:56.088787+00	2025-09-06 16:18:56.088787+00
3c55e42a-f896-4d30-9b39-6a11210510e4	vijay.hegde	vijay.hegde@player.com	player123	player	\N	2025-09-06 16:18:56.091632+00	2025-09-06 16:18:56.091632+00
cb229566-e6fe-4ec1-919b-c0737b4ddc56	gurumurthy..m..bhat	gurumurthy..m..bhat@player.com	player123	player	\N	2025-09-06 16:18:56.09444+00	2025-09-06 16:18:56.09444+00
575fc79c-4bf9-4cca-895f-ae19e81370c2	aruna.g	aruna.g@player.com	player123	player	\N	2025-09-06 16:18:56.097346+00	2025-09-06 16:18:56.097346+00
88a429b4-9661-4305-a3ae-5b40dd64039e	ganesha.gr	ganesha.gr@player.com	player123	player	\N	2025-09-06 16:18:56.100167+00	2025-09-06 16:18:56.100167+00
e1e33cd9-8216-4dc0-8dc2-cebc047da69b	shrikant.p.yalakki	shrikant.p.yalakki@player.com	player123	player	\N	2025-09-06 16:18:56.103247+00	2025-09-06 16:18:56.103247+00
1388663e-f40f-46dd-ac54-b8920bf34df4	sureshk	sureshk@player.com	player123	player	\N	2025-09-06 16:18:56.106114+00	2025-09-06 16:18:56.106114+00
72ec6940-9483-4143-97a3-6a2c24e5f456	adarsha.m.hegde	adarsha.m.hegde@player.com	player123	player	\N	2025-09-06 16:18:56.108989+00	2025-09-06 16:18:56.108989+00
9b067b5e-2c80-4d76-ba11-f4e3e575f872	adarsha.kote	adarsha.kote@player.com	player123	player	\N	2025-09-06 16:18:56.111892+00	2025-09-06 16:18:56.111892+00
8a7480de-c55f-41c5-a3c9-7349f7d477ab	susharma.ks	susharma.ks@player.com	player123	player	\N	2025-09-06 16:18:56.114887+00	2025-09-06 16:18:56.114888+00
6373780b-74e1-4c85-9e7e-768ff71c6481	manoj.shilageramane	manoj.shilageramane@player.com	player123	player	\N	2025-09-06 16:18:56.117663+00	2025-09-06 16:18:56.117663+00
be34faaa-35c8-4529-9f5f-546ad7a3b560	shrirang.ramachandra.hegde	shrirang.ramachandra.hegde@player.com	player123	player	\N	2025-09-06 16:18:56.120605+00	2025-09-06 16:18:56.120605+00
b0901f59-466a-4e5c-9db1-281603d32676	nagaraj.bhat	nagaraj.bhat@player.com	player123	player	\N	2025-09-06 16:18:56.123531+00	2025-09-06 16:18:56.123531+00
89fbcc2a-ec66-4814-bcc9-f9676dfa35d7	vineethdiwakar.bhat	vineethdiwakar.bhat@player.com	player123	player	\N	2025-09-06 16:18:56.126389+00	2025-09-06 16:18:56.126389+00
2a6bd25b-c033-49b2-ae9d-fd6a73e4d6ff	nagaraja.hs	nagaraja.hs@player.com	player123	player	\N	2025-09-06 16:18:56.129418+00	2025-09-06 16:18:56.129418+00
76559e26-3680-4e2f-a77e-dd47ba09a200	janardhan.hebbar	janardhan.hebbar@player.com	player123	player	\N	2025-09-06 16:18:56.132307+00	2025-09-06 16:18:56.132307+00
0f0c7eeb-9fea-4076-8897-ecb3370fae26	manoj.bhat	manoj.bhat@player.com	player123	player	\N	2025-09-06 16:18:56.135184+00	2025-09-06 16:18:56.135184+00
fb2b5979-d0fe-4536-bb13-1f33c5887811	mahabaleswara.bhatta.hs	mahabaleswara.bhatta.hs@player.com	player123	player	\N	2025-09-06 16:18:56.138075+00	2025-09-06 16:18:56.138075+00
40f72840-b5ea-428b-80f0-e6dadd29518a	vikaskbhat	vikaskbhat@player.com	player123	player	\N	2025-09-06 16:18:56.141116+00	2025-09-06 16:18:56.141116+00
1a5684f1-329b-4974-9dc0-0268bc69476b	ganapati.pandit	ganapati.pandit@player.com	player123	player	\N	2025-09-06 16:18:56.144881+00	2025-09-06 16:18:56.144881+00
efbd6b90-0afd-481c-8d51-1cb4e536f520	ramakrishna.bhat	ramakrishna.bhat@player.com	player123	player	\N	2025-09-06 16:18:56.149068+00	2025-09-06 16:18:56.149068+00
d0b2881b-f716-44cc-b2ec-0ef2acbcb99c	madan.sharma	madan.sharma@player.com	player123	player	\N	2025-09-06 16:18:56.151933+00	2025-09-06 16:18:56.151933+00
9a6068f1-ffc4-41f0-af0e-898cac8447ee	arjun.vikram.hegde	arjun.vikram.hegde@player.com	player123	player	\N	2025-09-06 16:18:56.155307+00	2025-09-06 16:18:56.155307+00
33b92894-cd7d-4b1b-8404-c1b06123f1a4	shrivatsa.shankar.hegde	shrivatsa.shankar.hegde@player.com	player123	player	\N	2025-09-06 16:18:56.158493+00	2025-09-06 16:18:56.158493+00
68bd5725-aaa9-4a5d-a5e7-291fb5d751cc	sachin.bhat	sachin.bhat@player.com	player123	player	\N	2025-09-06 16:18:56.161295+00	2025-09-06 16:18:56.161295+00
3c91f794-2554-486f-b2a3-13cb8c1c720f	anirudhbhat	anirudhbhat@player.com	player123	player	\N	2025-09-06 16:18:56.164128+00	2025-09-06 16:18:56.164128+00
ae65d90c-3806-4976-a404-05a5e26e7eda	vinay.vidyadhar.hegde	vinay.vidyadhar.hegde@player.com	player123	player	\N	2025-09-06 16:18:56.167018+00	2025-09-06 16:18:56.167018+00
92b801d5-1288-4b31-8a1c-b95ad856e8cc	nahusha.ms	nahusha.ms@player.com	player123	player	\N	2025-09-06 16:18:56.169711+00	2025-09-06 16:18:56.169711+00
66bea8bd-8cb9-4f6a-862f-133fc9e10252	sharathkumar	sharathkumar@player.com	player123	player	\N	2025-09-06 16:18:56.173345+00	2025-09-06 16:18:56.173345+00
4cc177ab-68e9-489a-a33c-e0721bb15816	arjuna.kote	arjuna.kote@player.com	player123	player	\N	2025-09-06 16:18:56.177263+00	2025-09-06 16:18:56.177263+00
4be97015-54c0-41c3-88da-d95231d8c9f2	amoghbhat	amoghbhat@player.com	player123	player	\N	2025-09-06 16:18:56.180535+00	2025-09-06 16:18:56.180535+00
25473b9f-4d45-4ff2-88f0-7eebe580ffeb	bhargav.satyanarayana.hegde	bhargav.satyanarayana.hegde@player.com	player123	player	\N	2025-09-06 16:18:56.18352+00	2025-09-06 16:18:56.18352+00
7bf41db1-603c-4928-bd7c-49634a8a23e3	mahendra.c.v	mahendra.c.v@player.com	player123	player	\N	2025-09-06 16:18:56.186422+00	2025-09-06 16:18:56.186422+00
808d5420-0fa2-4fc2-83c1-3229d457e9a4	vinay.shreepati.kodsar	vinay.shreepati.kodsar@player.com	player123	player	\N	2025-09-06 16:18:56.18924+00	2025-09-06 16:18:56.189241+00
ef0768d7-3408-4065-8a3d-93274c4ab8a5	nitin.shegde	nitin.shegde@player.com	player123	player	\N	2025-09-06 16:18:56.192114+00	2025-09-06 16:18:56.192114+00
5babfbcd-057d-41f3-acce-d3cc33ba0a46	deepakg.hegde	deepakg.hegde@player.com	player123	player	\N	2025-09-06 16:18:56.196159+00	2025-09-06 16:18:56.196159+00
f8daa86e-2c9a-45c4-955e-c030de293b19	shrinidhi.s	shrinidhi.s@player.com	player123	player	\N	2025-09-06 16:18:56.199029+00	2025-09-06 16:18:56.199029+00
46576f2a-db4e-4c3f-9da8-4380712ecfda	sandeshhemadri	sandeshhemadri@player.com	player123	player	\N	2025-09-06 16:18:56.202078+00	2025-09-06 16:18:56.202078+00
71bf7e9c-95e9-46c5-b0a3-43177f320a51	ganeshnagapati.hegde	ganeshnagapati.hegde@player.com	player123	player	\N	2025-09-06 16:18:56.20522+00	2025-09-06 16:18:56.20522+00
41b182e6-d2e1-41f2-803c-fa7b43b94c48	anoop.vinayakhegde	anoop.vinayakhegde@player.com	player123	player	\N	2025-09-06 16:18:56.208164+00	2025-09-06 16:18:56.208164+00
45d64cf1-69f9-4f19-90c3-c7e227c446d7	darshan.r.bhat	darshan.r.bhat@player.com	player123	player	\N	2025-09-06 16:18:56.211061+00	2025-09-06 16:18:56.211062+00
d3878244-4e83-49c6-8951-4f237f3851ed	abhishekbhat	abhishekbhat@player.com	player123	player	\N	2025-09-06 16:18:56.214452+00	2025-09-06 16:18:56.214452+00
2dad1b30-944b-4198-aed2-57751b645695	nishant.n.hegde	nishant.n.hegde@player.com	player123	player	\N	2025-09-06 16:18:56.217381+00	2025-09-06 16:18:56.217381+00
f424c699-5b64-4898-b43d-970f867a5656	karthikshripad.hegde	karthikshripad.hegde@player.com	player123	player	\N	2025-09-06 16:18:56.220103+00	2025-09-06 16:18:56.220103+00
e8e2f7a1-b690-4f42-8a8b-d4740295961a	pruthviraj.raveeshbhat	pruthviraj.raveeshbhat@player.com	player123	player	\N	2025-09-06 16:18:56.22381+00	2025-09-06 16:18:56.22381+00
fc726a07-35fe-4cf8-9039-fd6f83005ac7	keshava.prasanna.m	keshava.prasanna.m@player.com	player123	player	\N	2025-09-06 16:18:56.227158+00	2025-09-06 16:18:56.227158+00
1ade140e-bda8-4cb4-8322-f0572b6a40d0	ganeshmurthy.hegde	ganeshmurthy.hegde@player.com	player123	player	\N	2025-09-06 16:18:56.229893+00	2025-09-06 16:18:56.229893+00
d0452b3e-8a66-47d4-acc7-c33fe2126dbf	vasuki.abhaya.sharma	vasuki.abhaya.sharma@player.com	player123	player	\N	2025-09-06 16:18:56.233178+00	2025-09-06 16:18:56.233178+00
fdde2ddb-2bcb-4eeb-820b-0ee7b36f2356	narayan.g.hegde	narayan.g.hegde@player.com	player123	player	\N	2025-09-06 16:18:56.236141+00	2025-09-06 16:18:56.236141+00
7a01ec3d-9084-4859-a087-2bc948bd61c0	shreeharsha.hegde	shreeharsha.hegde@player.com	player123	player	\N	2025-09-06 16:18:56.238995+00	2025-09-06 16:18:56.238995+00
225c7745-67e4-4684-884f-659260fec528	lokeshshreedar.hebbar	lokeshshreedar.hebbar@player.com	player123	player	\N	2025-09-06 16:18:56.242204+00	2025-09-06 16:18:56.242204+00
5c6b06f8-0340-4387-b1fc-aed5894dd6d5	adithya.kote	adithya.kote@player.com	player123	player	\N	2025-09-06 16:18:56.245422+00	2025-09-06 16:18:56.245422+00
decf4b25-f3e6-4aab-990b-60e60dc2acdc	manojava.bhat	manojava.bhat@player.com	player123	player	\N	2025-09-06 16:18:56.248211+00	2025-09-06 16:18:56.248211+00
c7b64bbb-a1ab-466f-bbfe-aba26752c9c9	gowtham.avabhrath	gowtham.avabhrath@player.com	player123	player	\N	2025-09-06 16:18:56.250948+00	2025-09-06 16:18:56.250948+00
66fe871b-bae7-4514-b151-b8d066d49cfc	kartikvinayakbhat	kartikvinayakbhat@player.com	player123	player	\N	2025-09-06 16:18:56.254726+00	2025-09-06 16:18:56.254726+00
fe10cf87-925e-41ec-bbda-0b2ba75d0b40	shriram.vinayakbhat	shriram.vinayakbhat@player.com	player123	player	\N	2025-09-06 16:18:56.258597+00	2025-09-06 16:18:56.258597+00
3062573c-4b77-4db0-b684-25f09213bf5c	tushar.kraysad	tushar.kraysad@player.com	player123	player	\N	2025-09-06 16:18:56.261355+00	2025-09-06 16:18:56.261356+00
cf4d9389-6ed0-4272-962c-71a87b40ade8	p.nagaraja.sharma	p.nagaraja.sharma@player.com	player123	player	\N	2025-09-06 16:18:56.264298+00	2025-09-06 16:18:56.264298+00
dd57590a-4d1f-4cba-8f27-5ca9a3b00a4d	shripati.bhat	shripati.bhat@player.com	player123	player	\N	2025-09-06 16:18:56.267817+00	2025-09-06 16:18:56.267817+00
9195bb8f-c888-402e-b4be-2391e9750746	prasann.hegde	prasann.hegde@player.com	player123	player	\N	2025-09-06 16:18:56.270868+00	2025-09-06 16:18:56.270868+00
f0b95883-ebcb-4ff2-86b4-97f91bab799c	gurudarshan.ganapati.hegde	gurudarshan.ganapati.hegde@player.com	player123	player	\N	2025-09-06 16:18:56.274547+00	2025-09-06 16:18:56.274547+00
bb5ad355-36f0-4c5c-8b2f-79d716e15c63	raveeshhegde	raveeshhegde@player.com	player123	player	\N	2025-09-06 16:18:56.27859+00	2025-09-06 16:18:56.27859+00
a6d6d2d8-4a6d-4771-b744-a48bbabc5219	vinod.kumar.n	vinod.kumar.n@player.com	player123	player	\N	2025-09-06 16:18:56.281435+00	2025-09-06 16:18:56.281435+00
fcf359df-b266-4886-bfda-701b16dd86c1	smanoj	smanoj@player.com	player123	player	\N	2025-09-06 16:18:56.28499+00	2025-09-06 16:18:56.28499+00
47050e5c-d64b-4640-b4c4-97812094ce82	ashwathhegde	ashwathhegde@player.com	player123	player	\N	2025-09-06 16:18:56.288042+00	2025-09-06 16:18:56.288042+00
cb772e00-b8cf-4ddd-ae1f-b65921d82be0	samithhegde	samithhegde@player.com	player123	player	\N	2025-09-06 16:18:56.290695+00	2025-09-06 16:18:56.290695+00
50d874bb-12a9-4055-ab64-ab523af1b1aa	pavan.vinayakbhat	pavan.vinayakbhat@player.com	player123	player	\N	2025-09-06 16:18:56.29358+00	2025-09-06 16:18:56.29358+00
5e39e95d-4241-4413-9b9d-745f562235f4	suhaschandra.shegde	suhaschandra.shegde@player.com	player123	player	\N	2025-09-06 16:18:56.29655+00	2025-09-06 16:18:56.29655+00
cfcb96ce-dc91-41b6-bd2c-90d795f9bccb	mahabaleshwara.sharma	mahabaleshwara.sharma@player.com	player123	player	\N	2025-09-06 16:18:56.299776+00	2025-09-06 16:18:56.299776+00
50207edc-385b-4075-877a-2918ff1c046d	abhishekhk	abhishekhk@player.com	player123	player	\N	2025-09-06 16:19:44.572909+00	2025-09-06 16:19:44.572909+00
1fab6a26-3b6f-40f9-a86a-ed46163ea398	murali.hegde	murali.hegde@player.com	player123	player	\N	2025-09-06 16:19:44.580357+00	2025-09-06 16:19:44.580357+00
5a7405d7-a26b-4b7f-9a4b-54a0fb6d0ffe	manjunathrao	manjunathrao@player.com	player123	player	\N	2025-09-06 16:19:44.586313+00	2025-09-06 16:19:44.586313+00
2caf3a5d-1436-491e-92f8-a5a67616152f	niranjan.ganapati.hegde	niranjan.ganapati.hegde@player.com	player123	player	\N	2025-09-06 16:19:44.591894+00	2025-09-06 16:19:44.591894+00
ba6281d0-b1ea-4cb7-89ff-8a146f288460	satvikbhat	satvikbhat@player.com	player123	player	\N	2025-09-06 16:19:44.602537+00	2025-09-06 16:19:44.602537+00
bd016887-6f91-4aaf-8abf-04ecda8c6c6f	akhil.hegde	akhil.hegde@player.com	player123	player	\N	2025-09-06 16:19:44.607954+00	2025-09-06 16:19:44.607954+00
d68e77f0-2e74-4da9-8064-38bd88307bfb	varsha.vineethbhat	varsha.vineethbhat@player.com	player123	player	\N	2025-09-06 16:19:44.613357+00	2025-09-06 16:19:44.613357+00
5769845e-729c-43fc-bf48-ebdf289adb9f	nandakishore.b	nandakishore.b@player.com	player123	player	\N	2025-09-06 16:19:44.618457+00	2025-09-06 16:19:44.618458+00
3c2f5517-9c32-4ce2-98ce-66af466b4cee	praveen.bhat	praveen.bhat@player.com	player123	player	\N	2025-09-06 16:19:44.628048+00	2025-09-06 16:19:44.628048+00
24d5d271-6a81-40a8-a5f4-9f82f0091180	kiran.j.bhat	kiran.j.bhat@player.com	player123	player	\N	2025-09-06 16:19:44.63292+00	2025-09-06 16:19:44.63292+00
3d1c73f9-ec33-4c6d-9725-865fedc4059a	prasanna.hj	prasanna.hj@player.com	player123	player	\N	2025-09-06 16:19:44.637707+00	2025-09-06 16:19:44.637707+00
ef67fbd3-3ba2-4a70-b44f-4ba8de1936d4	pradeep.kumar.p	pradeep.kumar.p@player.com	player123	player	\N	2025-09-06 16:19:44.642359+00	2025-09-06 16:19:44.642359+00
0fec4065-eae7-49d7-a928-f4c7b8fdf31f	gururaj.hegde	gururaj.hegde@player.com	player123	player	\N	2025-09-06 16:19:44.654608+00	2025-09-06 16:19:44.654608+00
af0b0617-15f4-4030-925c-8dee316abd18	ashwini.kumar.bhat	ashwini.kumar.bhat@player.com	player123	player	\N	2025-09-06 16:19:44.659409+00	2025-09-06 16:19:44.659409+00
ea2fa9f3-6146-4d46-bc0c-ca19bd2cb561	prajwal.g.bhat	prajwal.g.bhat@player.com	player123	player	\N	2025-09-06 16:19:44.663977+00	2025-09-06 16:19:44.663977+00
f11c17b2-e93a-4fcb-99d8-77f9aca4aa6f	dineshr.hegde	dineshr.hegde@player.com	player123	player	\N	2025-09-06 16:19:44.668698+00	2025-09-06 16:19:44.668698+00
a32a5706-37b9-4dfa-a29c-2bafc502c5ea	twisha.hegde	twisha.hegde@player.com	player123	player	\N	2025-09-06 16:19:44.67786+00	2025-09-06 16:19:44.67786+00
624e569a-8c58-489b-b342-40ce0cb94cb5	digant.hegde	digant.hegde@player.com	player123	player	\N	2025-09-06 16:19:44.684003+00	2025-09-06 16:19:44.684003+00
dc655775-d1d8-46b0-8d73-223d7b2af0ba	shreyaskumar.m	shreyaskumar.m@player.com	player123	player	\N	2025-09-06 16:19:44.691848+00	2025-09-06 16:19:44.691848+00
e672843d-8534-4095-93ea-e49cf616b2f9	surendra.radhakrishna.hegde	surendra.radhakrishna.hegde@player.com	player123	player	\N	2025-09-06 16:19:44.697822+00	2025-09-06 16:19:44.697822+00
eb53d269-2271-47ae-960b-4710fa56e31e	phoenix_smashers_user	phoenix_smashers@team.com	phoenix@1234	team	22fe2b64-e93d-44bc-8119-c6da9550653f	2025-09-06 16:19:44.570657+00	2025-09-06 16:19:44.570657+00
c1277e6d-320d-4f6a-a8dc-619ef09c8861	racquet_renegades_user	racquet_renegades@team.com	racqet@2025	team	4654ff70-6b21-4fc4-b456-56a201b63535	2025-09-06 16:19:44.600785+00	2025-09-06 16:19:44.600785+00
a6c37be6-2c6e-4f99-b3ee-1046f30d0d7f	roaring_lions_user	roaring_lions@team.com	lions@1990	team	e69a7f4e-5088-4bc0-aa4d-3a8c7cb0a596	2025-09-06 16:19:44.62636+00	2025-09-06 16:19:44.62636+00
9a80f225-095e-4763-9499-7c824775286f	team_g_user	team_g@team.com	teamg@2020	team	dee0695f-dc4b-495a-a4e0-d1c2d113f720	2025-09-06 16:19:44.653002+00	2025-09-06 16:19:44.653002+00
504599e4-8360-4c2d-a9ac-bccd9c0728f7	team_inspire_user	team_inspire@team.com	inspire@1947	team	6d1ceb6e-113d-47a6-9d6f-34107f37131c	2025-09-06 16:19:44.676258+00	2025-09-06 16:19:44.676258+00
028ddce2-a546-4e79-a003-5b191d70734a	admin	admin@auction.com	admin123	admin	\N	\N	\N
438bcc1f-4c96-4134-9cbc-1a95181d690b	Vinay Narasimha Joshi	vinay.narasimha@player.com	player123	player	\N	2025-09-06 16:18:56.022025+00	2025-09-06 16:18:56.022025+00
\.


--
-- Name: auctions auctions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auctions
    ADD CONSTRAINT auctions_pkey PRIMARY KEY (id);


--
-- Name: bids bids_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bids
    ADD CONSTRAINT bids_pkey PRIMARY KEY (id);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: player_categories player_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_categories
    ADD CONSTRAINT player_categories_pkey PRIMARY KEY (id);


--
-- Name: players players_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_pkey PRIMARY KEY (id);


--
-- Name: retained_players retained_players_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.retained_players
    ADD CONSTRAINT retained_players_pkey PRIMARY KEY (id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: bids fk_bids_auction; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bids
    ADD CONSTRAINT fk_bids_auction FOREIGN KEY (auction_id) REFERENCES public.auctions(id);


--
-- Name: bids fk_bids_player; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bids
    ADD CONSTRAINT fk_bids_player FOREIGN KEY (player_id) REFERENCES public.players(id);


--
-- Name: bids fk_bids_team; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bids
    ADD CONSTRAINT fk_bids_team FOREIGN KEY (team_id) REFERENCES public.teams(id);


--
-- Name: player_categories fk_player_categories_category; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_categories
    ADD CONSTRAINT fk_player_categories_category FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: player_categories fk_player_categories_player; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_categories
    ADD CONSTRAINT fk_player_categories_player FOREIGN KEY (player_id) REFERENCES public.players(id);


--
-- Name: players fk_players_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT fk_players_user FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: retained_players fk_retained_players_player; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.retained_players
    ADD CONSTRAINT fk_retained_players_player FOREIGN KEY (player_id) REFERENCES public.players(id);


--
-- Name: retained_players fk_retained_players_team; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.retained_players
    ADD CONSTRAINT fk_retained_players_team FOREIGN KEY (team_id) REFERENCES public.teams(id);


--
-- Name: players fk_teams_players; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT fk_teams_players FOREIGN KEY (current_team_id) REFERENCES public.teams(id);


--
-- PostgreSQL database dump complete
--

\unrestrict M3IbtrBOzhD1g5dRLWdTcSCX7TF6mhSIuxqpbtBwbCtMJ3HKima6ySTCyvZdAxB

