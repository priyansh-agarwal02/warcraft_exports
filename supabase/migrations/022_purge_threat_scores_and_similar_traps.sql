-- ==============================================================================
-- Migration: 022_purge_threat_scores_and_similar_traps.sql
-- Purpose: Purge 43 confirmed threat score emails (Score 3 & 4) and matching pattern traps
-- Safety Backup: scripts/subscribers_backup_2026_11.json
-- Rollback: Re-import deleted rows from scripts/subscribers_backup_2026_11.json
-- ==============================================================================

DELETE FROM newsletter_subscribers
WHERE id IN (
  '38fcff63-43cb-4801-ad7f-dd0ac0ed6cb5', -- scraped_trade_keyword_tax | elitetaxllc1@gmail.com
  '9ec2e611-51bc-454a-bbaf-b3befb2029d6', -- confirmed_threat_checker | annalena.petersen@gmx.de
  'df79df7d-b415-49e5-8f6e-78568ab584af', -- german_gmx_burst_trap | fuat-nuredini@web.de
  '4093ec70-5eca-4655-a4f6-facbef7ffe81', -- confirmed_threat_checker | danzgear@aol.com
  'fa96f8ac-a284-4956-82bd-a0d2b52d36cb', -- confirmed_threat_checker | roxy8405@hotmail.com
  '26c28116-8220-4f55-a4cb-32e063894993', -- scraped_trade_keyword_service | armorservicesllc08@gmail.com
  '6ed8ac47-0285-4b79-97ec-7e7c8f4b4333', -- confirmed_threat_checker | tobias.koreng@gmx.de
  'e7c2ce9e-9bd9-4d10-8c32-d650e3b00037', -- sept_burst_digit_pattern | wmcabee2012@gmail.com
  'f6a01688-4f86-426b-a757-d7c82ee68f55', -- sept_burst_digit_pattern | penn6754@aol.com
  '54331481-1340-43fc-bc56-30b896161a78', -- scraped_trade_keyword_truck | kfiretruck@gmail.com
  'a17c9c31-a02d-4a8a-b8e1-0564d853b25f', -- sept_burst_digit_pattern | svb002635@gmail.com
  'b050a0f8-06f1-42a5-a0a4-76b53f91ec9c', -- german_gmx_burst_trap | m.c.p.2@web.de
  '5cc80de7-76ad-4c81-9567-03e06efa46cf', -- sept_burst_digit_pattern | robhinson1146@gmail.com
  '082357fa-46f8-400b-9919-b745048be2b3', -- german_gmx_burst_trap | andreas-schmitz1990@gmx.de
  '41296a40-e98f-4b79-b088-710e6044988d', -- sept_burst_digit_pattern | dwifey1998@gmail.com
  'f04ee6a7-8d7e-40d6-b000-058375eda7b8', -- scraped_trade_keyword_shop | robertsbodyshopp@gmail.com
  '67877726-23be-4fda-8dea-9002fd4b5be8', -- sept_burst_digit_pattern | ashleyyespinoza3002@gmail.com
  '01930b6d-92ac-4c5e-b293-ade81f9afe3e', -- german_gmx_burst_trap | petra-schwermer@web.de
  'a8cb5410-ef89-464c-b09b-b17a9b541b34', -- confirmed_threat_checker | sharimaloney@gmail.com
  '4fe736b5-55e1-4b24-aa43-eb18f8d12825', -- sept_burst_digit_pattern | hannahhake2213@gmail.com
  '1b67e4e7-7645-4c39-9094-66ab8a97e6df', -- sept_burst_digit_pattern | phoenixrisen2013@outlook.com
  'b9c7cfdd-23aa-4d24-bbcd-58ea35a23149', -- confirmed_threat_checker | austinlawyer@hotmail.com
  'c4c16fe3-b058-486f-b014-e80a5c53fb54', -- sept_burst_digit_pattern | cdeg_0629@yahoo.com
  '484d680e-41b9-4283-be27-4d1bcbeba3f4', -- german_gmx_burst_trap | sven.schaefing@gmx.de
  'b2c5a479-1069-49de-a738-7162be9fc4e3', -- sept_burst_digit_pattern | gpen2650@hotmail.com
  'fe198ee0-a2b8-4504-965b-b235013ebb85', -- sept_burst_digit_pattern | pm02832@yahoo.com
  '76f96e47-7794-410e-9df1-ac10e4e5c071', -- german_gmx_burst_trap | pia.rat@web.de
  '9e907b83-da36-41e9-9cd8-28ea792b76c3', -- german_gmx_burst_trap | bruno.monteleone@web.de
  '1872ba75-f484-418f-88fc-8b0b793c6daf', -- german_gmx_burst_trap | b.kunze@gmx.de
  '5c32396d-5f06-4745-b747-9ddd18e2dda7', -- german_gmx_burst_trap | sabine.behr@gmx.de
  '870f0a87-65b8-4b00-9774-01ce62c1871e', -- sept_burst_digit_pattern | rdean14700@verizon.net
  '39bbca3f-2c11-41f9-b4b9-c8a8d81880d3', -- sept_burst_digit_pattern | duffmusic1993@hotmail.com
  '0c9c9b7f-b42a-4918-8aad-4e123e1ff27c', -- german_gmx_burst_trap | christian.wartmann@gmx.net
  'c2a8d8e7-bf4b-4058-b279-902abe817f21', -- sept_burst_digit_pattern | ayoubalani58917@outlook.com
  'a4c721bc-fe9e-422b-9a78-0b514516a580', -- german_gmx_burst_trap | rico.stoerck@gmx.de
  'fe699170-38ab-4145-bdee-8601cff6e926', -- scraped_trade_keyword_dental | animaldentalclinic@windstream.net
  'df5e5ca5-a4d0-4d06-9588-34263c4bf6bc', -- german_gmx_burst_trap | d.fabriz@gmx.de
  '37490b19-2b28-4edb-9105-0d0530da638c', -- german_gmx_burst_trap | maria.wilkens60@web.de
  '04589f57-68d2-493e-a415-76c1a9cdc738', -- german_gmx_burst_trap | max-empire@gmx.de
  '75b14f64-100e-42ad-96e3-6abe7093b0fd', -- scraped_trade_keyword_express | rayexpress13@gmail.com
  '573344da-3cdb-47f4-b622-46cf6b51144a', -- scraped_trade_keyword_dental | dentalbassano@gmail.com
  '4b470097-4e32-4e56-b3ed-25fd83b5771b', -- confirmed_threat_checker | gingerrosacker@gmail.com
  '82c91162-a28c-47e6-ab92-b4a529744403' -- confirmed_threat_checker | nogert@roadrunner.com
);
