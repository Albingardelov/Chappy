import './Input.css'

function Input({ 
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  name
}) {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="input"
    />
  )
}

export default Input

