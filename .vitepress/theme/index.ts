import DefaultTheme from 'vitepress/theme'
import './custom.css'
import TodoList from './components/TodoList.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('TodoList', TodoList)
  }
}
