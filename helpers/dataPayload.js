
class DataSendFormat {
   constructor(status, payload, errors) {
      this.status = status;
      this.payload = payload;
      this.errors = errors;
   }

   get getStatus() {
      return this.status;
   }
   get getPayload() {
      return this.payload;
   }
   get getErrors() {
      return this.errors;
   }

   set setStatus(newSatus) {
      this.status = newSatus;
   }

   set setPayload(newPayload) {
      this.payload = newPayload;
   }

   set setErrors(newErrors) {
      this.Errors = newErrors;
   }
}

module.exports = DataSendFormat;