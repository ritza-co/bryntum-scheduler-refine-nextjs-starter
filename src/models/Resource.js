import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Resource = sequelize.define(
    'Resource',
    {
        id : {
            type          : DataTypes.INTEGER,
            primaryKey    : true,
            autoIncrement : true
        },
        name : {
            type      : DataTypes.STRING,
            allowNull : false
        },
        eventColor : {
            type         : DataTypes.STRING,
            defaultValue : null
        },
        readOnly : {
            type         : DataTypes.BOOLEAN,
            defaultValue : false
        },
        expanded : {
            type         : DataTypes.BOOLEAN,
            defaultValue : false
        },
        parentIndex : {
            type         : DataTypes.INTEGER,
            defaultValue : 0
        }
    },
    {
        tableName  : 'resources',
        timestamps : false
    }
);

export default Resource;
