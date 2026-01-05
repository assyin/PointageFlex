"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEmailTemplateDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_email_template_dto_1 = require("./create-email-template.dto");
class UpdateEmailTemplateDto extends (0, mapped_types_1.PartialType)(create_email_template_dto_1.CreateEmailTemplateDto) {
}
exports.UpdateEmailTemplateDto = UpdateEmailTemplateDto;
//# sourceMappingURL=update-email-template.dto.js.map