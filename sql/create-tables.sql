create table ingredient (
id smallint unsigned not null auto_increment,
name varchar(30),
type char(5),
primary key (id)
);

create table utensil (
id smallint unsigned not null auto_increment,
name varchar(30),
waitTimeInMillis integer,
primary key (id)
);

create table step (
input smallint unsigned not null references ingredient(id),
utensil smallint unsigned not null references utensil(id),
output smallint unsigned not null references ingredient(id)
);

create view detailed_step as select 
input.id as input_id, input.name as input_name, input.type as input_type,
utensil.id as utensil_id, utensil.name as utensil_name, utensil.waitTimeInMillis as utensil_waitTimeInMillis,
output.id as output_id, output.name as output_name, output.type as output_type
from step
left join ingredient as input on step.input = input.id
left join utensil on step.utensil = utensil.id
left join ingredient as output on step.output = output.id;

create view recipe as select 
step1.input as input, step1.utensil as utensil1, step1.output as mid1,
step2.utensil as utensil2, step2.output as mid2,
step3.utensil as utensil3, step3.output as mid3,
step4.utensil as utensil4, step4.output as mid4,
step5.utensil as utensil5, step5.output as mid5
from ingredient
left join step as step1 on step1.input = ingredient.id
left join step as step2 on step2.input = step1.output
left join step as step3 on step3.input = step2.output
left join step as step4 on step4.input = step3.output
left join step as step5 on step5.input = step4.output
where ingredient.type = 'start';

create view detailed_recipe as select 
input.id as inputId, input.name as inputName, input.type as inputType,
utensil1.id as utensil1Id, utensil1.name as utensil1Name, utensil1.waitTimeInMillis as waitTimeInMillis1,
mid1.id as mid1Id, mid1.name as mid1Name, mid1.type as mid1Type, 
utensil2.id as utensil2Id, utensil2.name as utensil2Name, utensil2.waitTimeInMillis as waitTimeInMillis2,
mid2.id as mid2Id, mid2.name as mid2Name, mid2.type as mid2Type, 
utensil3.id as utensil3Id, utensil3.name as utensil3Name, utensil3.waitTimeInMillis as waitTimeInMillis3,
mid3.id as mid3Id, mid3.name as mid3Name, mid3.type as mid3Type, 
utensil4.id as utensil4Id, utensil4.name as utensil4Name, utensil4.waitTimeInMillis as waitTimeInMillis4,
mid4.id as mid4Id, mid4.name as mid4Name, mid4.type as mid4Type, 
utensil5.id as utensil5Id, utensil5.name as utensil5Name, utensil5.waitTimeInMillis as waitTimeInMillis5,
mid5.id as mid5Id, mid5.name as mid5Name, mid5.type as mid5Type 
 from recipe
left join ingredient as input on input.id = recipe.input
left join utensil as utensil1 on utensil1.id = recipe.utensil1
left join ingredient as mid1 on mid1.id = recipe.mid1
left join utensil as utensil2 on utensil2.id = recipe.utensil2
left join ingredient as mid2 on mid2.id = recipe.mid2
left join utensil as utensil3 on utensil3.id = recipe.utensil3
left join ingredient as mid3 on mid3.id = recipe.mid3
left join utensil as utensil4 on utensil4.id = recipe.utensil4
left join ingredient as mid4 on mid4.id = recipe.mid4
left join utensil as utensil5 on utensil5.id = recipe.utensil5
left join ingredient as mid5 on mid5.id = recipe.mid5;
