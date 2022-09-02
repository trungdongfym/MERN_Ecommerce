
class httpErrors extends Error {
   constructor(status, message) {
      super(message);
      this.status = status;
   }

   static BadRequest(message) {
      return new httpErrors(400, message);
   }

   static Forbiden(message) {
      return new httpErrors(403, message);
   }

   static Conflict(message) {
      return new httpErrors(409, message);
   }

   static NotFound(message) {
      return new httpErrors(404, message);
   }

   static Unauthorized(message) {
      return new httpErrors(401, message);
   }

   static ServerError(message) {
      return new httpErrors(500, message);
   }
}

module.exports = httpErrors;