const mongoose = require('mongoose');
const User = require('../models/adminModel');

const Schema = mongoose.Schema

const SecurityRoleSchema = new Schema({

    admin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "dd_admin"
    },
    role_name:{
        type:String
    },
    role_desc:{
        type:String
    },
    account: {
        type: String,
    },
    opportunity: {
        type: String,
    },
    oppor_stage: {
        type: String,
    },
    oppor_survey: {
        type: String,
    },
    quote: {
        type: String,
    },
    quote_add: {
        type: String,
    },
    quote_approval: {
        type: String,
    },
    quote_guideSel_ans: {
        type: String,
    },
    quote_guidesel_desg: {
        type: String,
    },
    quote_listing: {
        type: String,
    },
    project: {
        type: String,
    },
    demand_workbench: {
        type: String,
    },
    demand_utilization: {
        type: String,
    },
    demand_people: {
        type: String,
    },
    demand_ppl_list: {
        type: String,
    },
    forecast: {
        type: String,
    },
    forecast_update: {
        type: String,
    },
    catalog: {
        type: String,
    },
    catalog_roles: {
        type: String,
    },
    catalog_ratecard: {
        type: String,
    },
    catalog_ratecard_config: {
        type: String,
    },
    catalog_exchange: {
        type: String,
    },
    catalog_items: {
        type: String,
    },
    catalog_content: {
        type: String,
    },
    catalog_assets: {
        type: String,
    },
    catalog_catalog: {
        type: String,
    },
    catalog_surevys: {
        type: String,
    },
    catalog_surevys_whereused: {
        type: String,
    },
    catalog_doctypes: {
        type: String,
    },
    notes: {
        type: String,
    },
    files: {
        type: String,
    },
    admin: {
        type: String,
    },
    admin_admin: {
        type: String,
    },
    admin_people: {
        type: String,
    },
    admin_access: {
        type: String,
    },
    admin_config: {
        type: String,
    },
    admin_lookups: {
        type: String,
    },
    admin_security: {
        type: String,
    },
    admin_alerts: {
        type: String,
    },
    admin_imports: {
        type: String,
    },
    admin_hooks_status: {
        type: String,
    },
    admin_hooks_config: {
        type: String,
    },
    created_at: {
        type: Date,
        default: new Date(),
    },
    modified_at: {
        type: Date,
        default: new Date(),
    }

});

module.exports = mongoose.model('dd_securityRole', SecurityRoleSchema);