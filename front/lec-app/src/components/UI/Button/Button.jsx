import classes from './Button.module.css'

const Button = (props) => {
    return (
        <button className={classes.Button}>{props.label}</button>
    )
}

  export default Button;