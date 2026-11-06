import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/unicompeng/',
  title: "Comp Eng. Resource Hub",
  description: "Lecture PDFs, Schedule & Homework",
  srcExclude: ['README.md'],
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Subjects', link: '/subjects/control' },
      { text: 'Schedule', link: '/schedule' },
      { text: 'To-Do', link: '/todo' }
    ],
    sidebar: [
      {
        text: 'المواد الدراسية',
        items: [
          { text: 'أسس هندسة السيطرة', link: '/subjects/control' },
          { text: 'اتصالات رقمية', link: '/subjects/dcs' },
          { text: 'معالجة الإشارة الرقمية', link: '/subjects/dsp' },
          { text: 'المسيطرات الدقيقة', link: '/subjects/mc' },
          { text: 'أنظمة التشغيل', link: '/subjects/os' },
          { text: 'أنظمة الزمن الحقيقي', link: '/subjects/rts' }
        ]
      }
    ]
  }
})