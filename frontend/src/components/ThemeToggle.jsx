
export default function ThemeToggle() {
  function toggle() {
    document.body.classList.toggle('dark');
  }
  return <button onClick={toggle}>🌙 / ☀️</button>;
}
