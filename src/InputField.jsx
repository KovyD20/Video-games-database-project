function InputField({ name, type, label, value, onChange }) {
  return (
    <div className={name}>
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} value={value} onChange={onChange} />
    </div>
  );
}
export default InputField;