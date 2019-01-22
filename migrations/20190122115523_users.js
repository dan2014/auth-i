
exports.up = function(knex, Promise) {
  knex.createTable("users", tbl =>{
      tbl.increment("id")

      tbl
      .string("username",255)
      .unique()
      .notNullable()

      tbl
      .string('name', 255)
      .notNullable();

      tbl
      .string("password",255)
      .notNullable()
  })
};

exports.down = function(knex, Promise) {
  
};
