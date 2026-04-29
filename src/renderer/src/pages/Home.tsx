import { Button } from '@/components/ui/button'
import electronLogo from '@/assets/tech-stack/electron.svg'
import electronViteLogo from '@/assets/tech-stack/electron-vite.svg'
import reactLogo from '@/assets/tech-stack/react.svg'
import shadcnLogo from '@/assets/tech-stack/shadcn.svg'
import tailwindcssLogo from '@/assets/tech-stack/tailwindcss.svg'

export default function Home() {

  const techStackList = [{
    name: 'Electron',
    logo: electronLogo,
    link: 'https://www.electronjs.org/'
  }, {
    name: 'electron-vite',
    logo: electronViteLogo,
    link: 'https://cn.electron-vite.org/'
  }, {
    name: 'React',
    logo: reactLogo,
    link: 'https://react.dev/'
  }, {
    name: 'shadcn/ui',
    logo: shadcnLogo,
    link: 'https://ui.shadcn.com/'
  }, {
    name: 'tailwindcss',
    logo: tailwindcssLogo,
    link: 'https://tailwindcss.com/'
  }];

  return (
    <div className="flex flex-col flex-1 px-10 py-12 min-h-0 overflow-hidden">
      <h1 className="text-5xl font-bold mb-8">Electron Template</h1>
      <h2 className="text-2xl font-semibold mb-4">技术栈</h2>
      <div className="flex flex-wrap gap-3">
        {techStackList.map((tech) => (
          <Button
            key={tech.name}
            variant="outline"
            asChild
            className="gap-2"
          >
            <a href={tech.link} target="_blank" rel="noopener noreferrer">
              <img src={tech.logo} alt={tech.name} className="w-5 h-5" />
              {tech.name}
            </a>
          </Button>
        ))}
      </div>
    </div>
  )
}