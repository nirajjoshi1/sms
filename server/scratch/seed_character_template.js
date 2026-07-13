require('dotenv').config();
const prisma = require('../src/config/prisma');

async function main() {
  const school = await prisma.school.findFirst();
  if (!school) {
    console.error("No school found in the database!");
    return;
  }

  console.log(`Found school: ${school.name} (${school.id})`);

  // Create the exact template from the image
  const template = await prisma.certificateTemplate.create({
    data: {
      name: "Manakamana Character / Transfer Certificate",
      headerLeftText: "Affiliated to HSEB\nBirtamode, Jhapa (Nepal)",
      headerCenterText: "MANAKAMANA HIGHER SECONDARY SCHOOL",
      headerRightText: "Motto: \"EDUCATION FOR CULTURE AND DIGNITY\"",
      bodyText: "This is to certify that Mr./Ms. {{studentName}} a resident of {{address}} son/daughter of Mr. {{fatherName}} studied the prescribed course in {{stream}} in this school from {{admissionYear}} to {{leavingYear}} as a regular student and duly passed the Higher Secondary Examination held in {{examYear}} and was placed in {{division}} Division. His/Her Registration no. is {{registrationNo}} and the date of birth is {{dob}}.\n\nHe/She bears good moral character.\n\nI wish him/her successful career and a bright future.",
      footerLeftText: "Class Teacher",
      footerCenterText: "",
      footerRightText: "Principal",
      studentPhoto: true,
      schoolId: school.id
    }
  });

  console.log(`Successfully created Certificate Template: "${template.name}" (ID: ${template.id})`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
