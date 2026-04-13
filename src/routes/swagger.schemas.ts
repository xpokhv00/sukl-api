/**
 * @swagger
 * components:
 *   schemas:
 *
 *     PaginationMeta:
 *       type: object
 *       properties:
 *         page:       { type: integer, example: 1 }
 *         limit:      { type: integer, example: 20 }
 *         total:      { type: integer, example: 68082 }
 *         totalPages: { type: integer, example: 3405 }
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: object
 *           properties:
 *             message: { type: string, example: "Medication not found" }
 *             details:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   field:   { type: string }
 *                   message: { type: string }
 *
 *     CodeName:
 *       type: object
 *       properties:
 *         code: { type: string }
 *         name: { type: string }
 *
 *     MedicationSummary:
 *       type: object
 *       properties:
 *         suklCode:               { type: string, example: "0217580" }
 *         name:                   { type: string, example: "IBUPROFEN AL 400" }
 *         strength:               { type: string, nullable: true, example: "400MG" }
 *         ean:                    { type: string, nullable: true }
 *         registrationNumber:     { type: string, nullable: true, example: "29/842/11-C" }
 *         atcCode:                { type: string, nullable: true, example: "M01AE01" }
 *         organizationCode:       { type: string, nullable: true }
 *         formCode:               { type: string, nullable: true, example: "TBL FLM" }
 *         routeCode:              { type: string, nullable: true, example: "POR" }
 *         dispensingCategoryCode: { type: string, nullable: true, example: "V" }
 *         registrationStatusCode: { type: string, nullable: true, example: "R" }
 *         isActive:               { type: boolean, nullable: true }
 *         atc:
 *           nullable: true
 *           allOf: [{ $ref: '#/components/schemas/CodeName' }]
 *         form:
 *           nullable: true
 *           allOf: [{ $ref: '#/components/schemas/CodeName' }]
 *         route:
 *           nullable: true
 *           allOf: [{ $ref: '#/components/schemas/CodeName' }]
 *         dispensingCategory:
 *           nullable: true
 *           allOf: [{ $ref: '#/components/schemas/CodeName' }]
 *         registrationStatus:
 *           nullable: true
 *           allOf: [{ $ref: '#/components/schemas/CodeName' }]
 *         organization:
 *           nullable: true
 *           allOf: [{ $ref: '#/components/schemas/CodeName' }]
 *         dependencyCategory:
 *           nullable: true
 *           allOf: [{ $ref: '#/components/schemas/CodeName' }]
 *         narcoticCategory:
 *           nullable: true
 *           allOf: [{ $ref: '#/components/schemas/CodeName' }]
 *         indicationGroup:
 *           nullable: true
 *           allOf: [{ $ref: '#/components/schemas/CodeName' }]
 *
 *     MedicationDocument:
 *       type: object
 *       properties:
 *         id:                 { type: string }
 *         medicationSuklCode: { type: string }
 *         type:               { type: string, enum: [PIL, SPC, PACKAGE_LEAFLET, OTHER] }
 *         title:              { type: string, nullable: true }
 *         url:                { type: string }
 *         updatedAt:          { type: string, format: date-time, nullable: true }
 *
 *     Disruption:
 *       type: object
 *       properties:
 *         id:                  { type: string }
 *         type:                { type: string, nullable: true }
 *         reason:              { type: string, nullable: true }
 *         isActive:            { type: boolean }
 *         reportedAt:          { type: string, format: date-time, nullable: true }
 *         startDate:           { type: string, format: date-time, nullable: true }
 *         endDate:             { type: string, format: date-time, nullable: true }
 *         replacementSuklCode: { type: string, nullable: true }
 *
 *     PriceReport:
 *       type: object
 *       properties:
 *         id:             { type: string }
 *         period:         { type: string, example: "202602" }
 *         maxPrice:       { type: number, nullable: true }
 *         reimbursement:  { type: number, nullable: true }
 *         patientCopay:   { type: number, nullable: true }
 *         dispensingMode: { type: string, nullable: true }
 *
 *     DispensingRestriction:
 *       type: object
 *       properties:
 *         id:              { type: string }
 *         restrictionType: { type: string, enum: [DOCTOR, PHARMACIST, PATIENT, OTHER] }
 *         description:     { type: string, nullable: true }
 *         validFrom:       { type: string, format: date-time, nullable: true }
 *         validTo:         { type: string, format: date-time, nullable: true }
 *
 *     MedicationDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/MedicationSummary'
 *         - type: object
 *           properties:
 *             medicationType:
 *               nullable: true
 *               allOf: [{ $ref: '#/components/schemas/CodeName' }]
 *             compositions:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:         { type: string }
 *                   amount:     { type: number, nullable: true }
 *                   unit:       { type: string, nullable: true }
 *                   type:       { type: string, enum: [ACTIVE, EXCIPIENT] }
 *                   substance:
 *                     type: object
 *                     properties:
 *                       id:      { type: string }
 *                       name:    { type: string }
 *                       innName: { type: string, nullable: true }
 *             documents:
 *               type: array
 *               items: { $ref: '#/components/schemas/MedicationDocument' }
 *             disruptions:
 *               type: array
 *               items: { $ref: '#/components/schemas/Disruption' }
 *             priceReports:
 *               type: array
 *               items: { $ref: '#/components/schemas/PriceReport' }
 *             dispensingRestrictions:
 *               type: array
 *               items: { $ref: '#/components/schemas/DispensingRestriction' }
 *             dopingEntries:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   dopingCategoryCode: { type: string }
 *                   dopingCategory:     { $ref: '#/components/schemas/CodeName' }
 *
 *     SubstanceSummary:
 *       type: object
 *       properties:
 *         id:      { type: string }
 *         name:    { type: string, example: "IBUPROFENUM" }
 *         innName: { type: string, nullable: true, example: "IBUPROFENUM" }
 *
 *     SubstanceDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/SubstanceSummary'
 *         - type: object
 *           properties:
 *             synonyms:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name: { type: string }
 *             compositions:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   amount:     { type: number, nullable: true }
 *                   unit:       { type: string, nullable: true }
 *                   type:       { type: string, enum: [ACTIVE, EXCIPIENT] }
 *                   medication:
 *                     type: object
 *                     properties:
 *                       suklCode: { type: string }
 *                       name:     { type: string }
 *                       strength: { type: string, nullable: true }
 *                       isActive: { type: boolean, nullable: true }
 *                       form:
 *                         nullable: true
 *                         allOf: [{ $ref: '#/components/schemas/CodeName' }]
 *
 *     PharmacyHour:
 *       type: object
 *       properties:
 *         dayOfWeek:  { type: integer, minimum: 0, maximum: 6, description: "0=Monday … 6=Sunday" }
 *         openTime:   { type: string, nullable: true, example: "08:00" }
 *         closeTime:  { type: string, nullable: true, example: "18:00" }
 *
 *     Pharmacy:
 *       type: object
 *       properties:
 *         id:          { type: string, example: "00200379227" }
 *         name:        { type: string }
 *         street:      { type: string, nullable: true }
 *         city:        { type: string, nullable: true }
 *         postalCode:  { type: string, nullable: true }
 *         country:     { type: string, nullable: true }
 *         type:        { type: string, nullable: true }
 *         email:       { type: string, nullable: true }
 *         phone:       { type: string, nullable: true }
 *         website:     { type: string, nullable: true }
 *         isMailOrder: { type: boolean, nullable: true }
 *         isDuty:      { type: boolean, nullable: true }
 *         hours:
 *           type: array
 *           items: { $ref: '#/components/schemas/PharmacyHour' }
 *
 *     Prescription:
 *       type: object
 *       properties:
 *         id:           { type: string }
 *         districtCode: { type: string, example: "3100" }
 *         districtName: { type: string, nullable: true, example: "Praha 4" }
 *         year:         { type: integer, example: 2026 }
 *         month:        { type: integer, example: 2 }
 *         suklCode:     { type: string, example: "0217580" }
 *         quantity:     { type: integer, example: 7907 }
 *
 *     RegistrationChange:
 *       type: object
 *       properties:
 *         id:                 { type: string }
 *         changeType:         { type: string, enum: [NEW, CANCELLED, CANCELLED_EU] }
 *         name:               { type: string }
 *         strength:           { type: string, nullable: true }
 *         formCode:           { type: string, nullable: true }
 *         routeCode:          { type: string, nullable: true }
 *         registrationNumber: { type: string, nullable: true }
 *         mrpNumber:          { type: string, nullable: true }
 *         holder:             { type: string, nullable: true }
 *         effectiveDate:      { type: string, format: date-time, nullable: true }
 *         statusCode:         { type: string, nullable: true }
 *
 *     AtcNode:
 *       type: object
 *       properties:
 *         code:       { type: string, example: "C09A" }
 *         name:       { type: string }
 *         level:      { type: integer, nullable: true }
 *         parentCode: { type: string, nullable: true }
 *
 *     AtcNodeDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/AtcNode'
 *         - type: object
 *           properties:
 *             children:
 *               type: array
 *               items: { $ref: '#/components/schemas/AtcNode' }
 *             medicationCount: { type: integer, example: 142 }
 *
 *     Intermediary:
 *       type: object
 *       properties:
 *         ic:                 { type: string, example: "17594332" }
 *         name:               { type: string, nullable: true, example: "ICG Farma, s.r.o." }
 *         city:               { type: string, nullable: true, example: "Mělany" }
 *         street:             { type: string, nullable: true }
 *         streetNumber:       { type: string, nullable: true }
 *         streetNumberOrient: { type: string, nullable: true }
 *         isLegalPerson:      { type: boolean, nullable: true, example: true }
 *         title:              { type: string, nullable: true }
 *         firstName:          { type: string, nullable: true }
 *         lastName:           { type: string, nullable: true }
 *         phone:              { type: string, nullable: true }
 *         email:              { type: string, nullable: true }
 *
 *     Organization:
 *       type: object
 *       properties:
 *         code:        { type: string, example: "0217580" }
 *         name:        { type: string, example: "TEVA Czech Industries s.r.o." }
 *         countryCode: { type: string, nullable: true, example: "CZ" }
 *         email:       { type: string, nullable: true }
 *         phone:       { type: string, nullable: true }
 *         website:     { type: string, nullable: true }
 *         address:     { type: string, nullable: true }
 */

// This file exists only to hold shared Swagger component definitions.
export {};
