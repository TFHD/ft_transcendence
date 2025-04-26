import { Sequelize } from 'sequelize';

//On creer la DB (database.sqlite)

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
});

export default sequelize;