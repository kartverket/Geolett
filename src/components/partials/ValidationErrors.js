const ValidationErrors = ({ errors }) => {
   return errors && errors.length ? (
      <ul className="validationErrors">
         { Array.isArray(errors)
            ? errors.map((error, index) => {
               return (<li key={`error-${index}`}>{error}</li>)
            })
            : (<li key={`error-0`}>{errors}</li>)
         }
      </ul>
   ) : '';
};

export default ValidationErrors