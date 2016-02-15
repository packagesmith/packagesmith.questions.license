import { readFile } from 'fs-promise';
import { valid as validateSpdxLicense } from 'spdx';
export function licenseQuestion({ defaultLicense = 'MIT' } = {}) {
  return {
    name: 'license',
    message: 'What license do you want for this project?',
    default: defaultLicense,
    validate: (license) => (
      validateSpdxLicense(license) || `${ license } is not a valid SPDX license!`
    ),
    async when(answers, directory) {
      if ('license' in answers) {
        return false;
      }
      try {
        const license = JSON.parse(await readFile(`${ directory }/package.json`, 'utf8')).license;
        if (license) {
          answers.license = license;
          return false;
        }
        return true;
      } catch (packageJsonError) {
        return true;
      }
    },
  };
}
export default licenseQuestion;
