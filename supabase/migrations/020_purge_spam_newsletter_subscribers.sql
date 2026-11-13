-- ==============================================================================
-- Migration: 020_purge_spam_newsletter_subscribers.sql
-- Purpose: Purge 65 confirmed bot, SMS gateway, and abuse trap records
-- Safety Backup: scripts/subscribers_backup_2026_11.json
-- Rollback: Re-import deleted rows from scripts/subscribers_backup_2026_11.json
-- ==============================================================================

DELETE FROM newsletter_subscribers
WHERE id IN (
  '48c01bfb-20dc-4c99-89cf-e1825ab7ca6c', -- 8155410698@mail.uscc.net
  '60d4fb51-ce43-489d-b6d3-c918a8b08fad', -- bookkeeper@urbanharvest.org
  '129019aa-180e-4b5f-a284-98533b502d80', -- admin@royalrib.com
  '48733791-4faf-4add-b0c2-099c171b421a', -- pijakiwaged55@gmail.com
  'b55a7d3e-dd57-4857-9558-13db3d7a44d9', -- ecuyeheva80@gmail.com
  '8f7e9a66-ae6a-471c-8d3c-df0c4164fdd1', -- ivenanekec28@gmail.com
  'b93f38d8-80b3-47df-a5f6-0eb3f536e935', -- cevapukiqiy31@gmail.com
  'b14ecd67-1be2-4cc0-a8ba-7ec8f50c2001', -- admin@rootsec.nl
  '65fa96d7-a1f7-4e06-b685-ccbedb9712c4', -- info@fedeco.biz
  '61a89cae-eb29-4e69-8a4b-165287940d95', -- 8505336871@txt.att.net
  'bda3ce08-8fe2-4030-a197-ec05ce5388ea', -- info@visapourcanada.com
  'c8c100a4-04c7-46f4-8729-943f4a625ce8', -- 2067909594@vtext.com
  '2c41559a-8275-4046-bae8-ecbb64583128', -- info@yumcrumbs.com
  '5ddd3700-a6cd-41ba-8972-57b2f0fb5415', -- 4192714615@vtext.com
  '7eb20bd5-7f6c-4a0f-9dc3-ecdb3f1e3f3d', -- 2133319825@vtext.com
  'fcc6344c-ff37-4424-b067-20ffc058c048', -- tootyzooty2112@gmail.com
  'd43a0ff1-27a3-431d-817a-6186dcb9e7ee', -- peytonbuhodkiewras67@gmail.com
  'a28b4a60-e852-48d7-b2b1-2b4b9147baab', -- landenpochristirrc70@gmail.com
  '3f472348-4472-46f4-b5d5-ef58e49da047', -- kemaduq594@gmail.com
  '6df76d9a-6fab-4095-a77d-ef1f9fb79456', -- info@danello.it
  'e11b72ea-1180-48f9-be2d-1196c6831de8', -- abuse@ziggo.nl
  '9a050b40-a9d5-45dc-9c24-9b79eb8de108', -- info@bettentrup.de
  '74413162-59f7-4af9-82b9-be21a1b93980', -- security@ziggo.nl
  'da77b9a5-f6c1-4fe7-a8f7-517f6c8500aa', -- security@korper.nl
  'fae27af5-ded9-44df-93a3-f2c4da109a28', -- info@abuse.nl
  '705ea3eb-f26d-4cd8-b328-c0d19fe9f928', -- info@korper.nl
  'f684557b-7eb9-4384-9c99-0a671efae34d', -- info@fortra.com
  'ca1a3b19-1f00-40d2-b88d-591a0cf511d5', -- info@jaegerhuette.de
  '8ba4274f-6f68-4052-9217-9e0366ea47c1', -- bacuvatira221@gmail.com
  '46af374d-16ee-4dc7-8bac-6ed5a3107d3c', -- ahesuvehaja95@gmail.com
  'f53950ed-2684-4d1b-b551-459eefcdb863', -- asuhihej600@gmail.com
  'cbaa42be-db56-4026-9deb-c4cb86650223', -- feqohetatam949@gmail.com
  '8f2dbcc3-2069-4a11-9bd2-baf61383f196', -- oboqozeyuz878@gmail.com
  '6e25266a-0b0e-490b-a08a-cf71324b27f8', -- igaqeqitu50@gmail.com
  '134b24ea-0ad9-4185-a3c4-e82e1bb79622', -- sifabacoc496@gmail.com
  'aaf3c99f-5e2e-42aa-8faf-2106c46b29e1', -- pmbdsw@aol.com
  'bc9b4f64-259d-44ad-a199-dacb299beec1', -- jofewusevo511@gmail.com
  '6a93a162-b744-433d-b259-88b78e05040b', -- info@acmehouseco.com
  '85e893a2-a057-49aa-b690-b2e5afb23b49', -- info@optimumwellnessclinic.ca
  '2df14450-c696-4f5a-ae66-b80b0a7e9b86', -- ipineqoyo20@gmail.com
  '32e48d9b-735d-467d-a519-43a81bf0136b', -- 3235342625@tmomail.net
  'bc74a247-2ef4-4021-9324-f897d6583f65', -- disivabukate86@gmail.com
  '8cc1fbb0-60cc-4d27-a221-3f36c9d4907b', -- ulexiqom778@gmail.com
  '707e6fa7-4676-473b-80e4-b6ce9e746dae', -- himicikixelu05@gmail.com
  '8f71bd8d-a763-4ea5-93b5-5221bc8ef889', -- 8052902711@vtext.com
  'bc932282-2e34-44a7-8974-f3e71e31400b', -- ufonamubigo08@gmail.com
  '26fcbfcb-2aa1-45ad-8dcd-7032399ed16f', -- fikiqonubu42@gmail.com
  'ed244f48-a6e7-4c53-b5be-70840b664a23', -- ihidukalodu56@gmail.com
  '4f7faba7-1ac8-4ca2-8312-7e1d5981bb37', -- lofohusepi267@gmail.com
  'c4e7a128-e5e1-4467-8c6d-55c28fa2363d', -- fohihagogi81@gmail.com
  '4baa220b-2007-4724-92b2-b5277e400639', -- imenoqajusu074@gmail.com
  'b012269f-25da-497c-a6dd-f3619557fc10', -- 8454067092@tmomail.net
  '0413482c-ccf1-4566-9a54-2037cbbf2489', -- torpedospam32@gmail.com
  '276e209c-745e-4d96-bb11-106767877a41', -- ikikeju637@gmail.com
  '64ba1993-8f2e-45d3-bac6-8ed8cfd7ef3d', -- 3025210122@txt.att.net
  'e88f711a-19b9-406a-8620-72855889bd9b', -- 7702981646@txt.att.net
  '3742c7bd-d329-41a2-89e6-ce53907a21b4', -- coyeneyise056@gmail.com
  '7e643018-a5c2-420f-a727-19f3b7f53d0c', -- info@ilgiardinodeilimoni.it
  '37e5009d-5211-417a-bd5e-5a7bc7a30cdf', -- fcfcfdhb@gmail.com
  '25ebfba7-6f77-49c7-86a3-9d7fce3717da', -- ozinonoyot11@gmail.com
  '2e554bc6-f4bd-4857-8605-317fcc02b896', -- sulecocu95@gmail.com
  '3a40cc7f-fc6c-44fa-b418-40114d5c5c83', -- dubajor581@gmail.com
  'b6add6a7-343c-4562-bccf-5e2e70df764a', -- obazebeguvo644@gmail.com
  'd0026f04-3009-4962-956e-c66442e58456', -- qarerago103@gmail.com
  'b46fd755-7214-432b-a03e-6076bfe99767' -- ozodomequfe000@gmail.com
);
