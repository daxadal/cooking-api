create table ingredient (
    id smallint unsigned not null auto_increment,
    name varchar(30),
    type char(5),

    primary key (id)
);
alter table ingredient auto_increment=101;

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
    case
        when step5.output is not null then 5
        when step4.output is not null then 4
        when step3.output is not null then 3
        when step2.output is not null then 2
        when step1.output is not null then 1
        else 0
    end as steps,
    step1.input as input, step1.utensil as utensil1, step1.output as mid1,
    step2.utensil as utensil2, step2.output as mid2,
    step3.utensil as utensil3, step3.output as mid3,
    step4.utensil as utensil4, step4.output as mid4,
    step5.utensil as utensil5, step5.output as mid5,
    case
        when step5.output is not null then step5.output
        when step4.output is not null then step4.output
        when step3.output is not null then step3.output
        when step2.output is not null then step2.output
        when step1.output is not null then step1.output
        else step1.input
    end as output
from ingredient
    left join step as step1 on step1.input = ingredient.id
    left join step as step2 on step2.input = step1.output
    left join step as step3 on step3.input = step2.output
    left join step as step4 on step4.input = step3.output
    left join step as step5 on step5.input = step4.output
where ingredient.type = 'start'
    and step1.output is not null;

create view detailed_recipe as select
    steps,
    input.id as input_id, input.name as input_name, input.type as input_type,
    utensil1.id as utensil1_id, utensil1.name as utensil1_name, utensil1.waitTimeInMillis as utensil1_waitTimeInMillis,
    mid1.id as mid1_id, mid1.name as mid1_name, mid1.type as mid1_type,
    utensil2.id as utensil2_id, utensil2.name as utensil2_name, utensil2.waitTimeInMillis as utensil2_waitTimeInMillis,
    mid2.id as mid2_id, mid2.name as mid2_name, mid2.type as mid2_type,
    utensil3.id as utensil3_id, utensil3.name as utensil3_name, utensil3.waitTimeInMillis as utensil3_waitTimeInMillis,
    mid3.id as mid3_id, mid3.name as mid3_name, mid3.type as mid3_type,
    utensil4.id as utensil4_id, utensil4.name as utensil4_name, utensil4.waitTimeInMillis as utensil4_waitTimeInMillis,
    mid4.id as mid4_id, mid4.name as mid4_name, mid4.type as mid4_type,
    utensil5.id as utensil5_id, utensil5.name as utensil5_name, utensil5.waitTimeInMillis as utensil5_waitTimeInMillis,
    mid5.id as mid5_id, mid5.name as mid5_name, mid5.type as mid5_type,
    output.id as output_id, output.name as output_name, output.type as output_type
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
    left join ingredient as mid5 on mid5.id = recipe.mid5,
    left join ingredient as output on output.id = recipe.output;
