const admin = require("../models/adminModel");
const CompanyOrg = require("../models/companyOrgModel");

const addCompanyOrg = async (req, res) => {
    
  let admin_id, people_id;

  if (req.user.admin_id) {
    // If req.user.admin_id is not empty
    admin_id = req.user.admin_id;
    people_id = req.user._id;
  } else {
    // If req.user.admin_id is empty
    admin_id = req.user._id;
    people_id = null;
  }
const {
    org_name,
    active,
    org_code,
    external_reference,
    parent_org,
    org_type,
    default_time_uom,
    week_hours,
    languages,
    currency,
    cola,
    pola,
    cost_read_only,
}= req.body;
try {

const companyorg_data = await CompanyOrg.create({
    org_name,
    active,
    org_code,
    external_reference,
    parent_org,
    org_type,
    default_time_uom,
    week_hours,
    languages,
    currency,
    cola,
    pola,
    cost_read_only,
  });

  if (companyorg_data) {
    res.status(200).json({ success: "Success" });
  } else {
    res.status(200).json({ error: "Failed" });
  }
} catch (error) {
  res.status(500).json({ error: "Failed" });
}
};
module.exports = {addCompanyOrg};
