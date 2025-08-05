exports.up = (pgm) => {
  pgm.createTable("users", {
    id: {
      type: "uuid",
      primarykey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    // For reference, GitHub username is limited to 39 characters
    username: {
      type: "varchar(30)",
      notNull: true,
      unique: true,
    },
    // Why 254 in length, https://stackoverflow.com/a/1199238
    email: {
      type: "varchar(254)",
      notNull: true,
      unique: true,
    },
    // Why 72 in length, https://security.stackexchange.com/posts/184090/edit
    password: {
      type: "varchar(72)",
      notNull: true,
    },
    // Why timestamp with timezone, https://justatheory.com/2012/04/postgres-use-timestamptz/
    create_at: {
      type: "timestamptz",
      default: pgm.func("now()"),
    },
    update_at: {
      type: "timestamptz",
      default: pgm.func("now()"),
    },
  });
};

exports.down = false;
