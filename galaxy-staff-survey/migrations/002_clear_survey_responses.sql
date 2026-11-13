-- Clear any rows left from a previous private preview deploy so a public
-- publish does not retain that batch. Additive cleanup only.
truncate table survey_responses restart identity;
