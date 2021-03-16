const ValidationErrors = ({ errors }) => {
    if (!errors.length) {
       return '';
    }
 
    return (
       <ul className="validationErrors">
          { errors.map((error, index) => <li key={`error-${index}`}>{error}</li>) }
       </ul>
    );
 };
 
 export default ValidationErrors