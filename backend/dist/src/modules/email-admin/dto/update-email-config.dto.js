"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEmailConfigDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_email_config_dto_1 = require("./create-email-config.dto");
class UpdateEmailConfigDto extends (0, mapped_types_1.PartialType)(create_email_config_dto_1.CreateEmailConfigDto) {
}
exports.UpdateEmailConfigDto = UpdateEmailConfigDto;
//# sourceMappingURL=update-email-config.dto.js.map