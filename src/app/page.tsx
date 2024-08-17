import { type Metadata } from 'next'
// import Image from 'next/image'
// import Link from 'next/link'

import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { List, ListItem } from '@/components/List'
import { SectionIntro } from '@/components/SectionIntro'
import { StylizedImage } from '@/components/StylizedImage'
import { Testimonial } from '@/components/Testimonial'
// import logoBrightPath from '@/images/clients/bright-path/logo-light.svg'
// import logoFamilyFund from '@/images/clients/family-fund/logo-light.svg'
// import logoGreenLife from '@/images/clients/green-life/logo-light.svg'
// import logoHomeWork from '@/images/clients/home-work/logo-light.svg'
// import logoMailSmirk from '@/images/clients/mail-smirk/logo-light.svg'
// import logoNorthAdventures from '@/images/clients/north-adventures/logo-light.svg'
// import logoPhobiaDark from '@/images/clients/phobia/logo-dark.svg'
// import logoPhobiaLight from '@/images/clients/phobia/logo-light.svg'
// import logoUnseal from '@/images/clients/unseal/logo-light.svg'
import imageLaptop from '@/images/laptop.jpg'
import logoMaxcess from '@/images/clients/maxcess-logo.png'
// import { type CaseStudy, type MDXEntry, loadCaseStudies } from '@/lib/mdx'

// const clients: Array<[string, string]> = [
//   // ['Phobia', logoPhobiaLight],
// ]

const ServicesDark = () => {
  return (
    <div className="mt-34 mt-24 rounded-4xl bg-neutral-950 pt-2">
      <Services invert={true}></Services>
    </div>
  )
}
// function Clients() {
//   return (
//     <div className="mt-24 rounded-4xl bg-neutral-950 py-20 sm:mt-32 sm:py-32 lg:mt-56">
//       <Container>
//         <FadeIn className="flex items-center gap-x-8">
//           <h2 className="text-center font-display text-sm font-semibold tracking-wider text-white sm:text-left">
//             We’ve collaborated with many incredible companies
//           </h2>
//           <div className="h-px flex-auto bg-neutral-800" />
//         </FadeIn>
//         <FadeInStagger faster>
//           <ul
//             role="list"
//             className="mt-10 grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4"
//           >
//             {clients.map(([client, logo]) => (
//               <li key={client}>
//                 <FadeIn>
//                   <Image src={logo} alt={client} unoptimized />
//                 </FadeIn>
//               </li>
//             ))}
//           </ul>
//         </FadeInStagger>
//       </Container>
//     </div>
//   )
// }

// function CaseStudies({
//   caseStudies,
// }: {
//   caseStudies: Array<MDXEntry<CaseStudy>>
// }) {
//   return (
//     <>
//       <SectionIntro
//         title="Automating engineering for a more efficient future"
//         className="mt-24 sm:mt-32 lg:mt-40"
//       >
//         <p>
//           At Aboni Tech, we believe in leveraging technology to enhance and streamline engineering processes. Our solutions connect departments and optimize workflows, driving innovation across the board.
//         </p>
//       </SectionIntro>
//       <Container className="mt-16">
//         <FadeInStagger className="grid grid-cols-1 gap-8 lg:grid-cols-3">
//           {caseStudies.map((caseStudy) => (
//             <FadeIn key={caseStudy.href} className="flex">
//               <article className="relative flex w-full flex-col rounded-3xl p-6 ring-1 ring-neutral-950/5 transition hover:bg-neutral-50 sm:p-8">
//                 <h3>
//                   <Link href={caseStudy.href}>
//                     <span className="absolute inset-0 rounded-3xl" />
//                     <Image
//                       src={caseStudy.logo}
//                       alt={caseStudy.client}
//                       className="h-16 w-16"
//                       unoptimized
//                     />
//                   </Link>
//                 </h3>
//                 <p className="mt-6 flex gap-x-2 text-sm text-neutral-950">
//                   <time
//                     dateTime={caseStudy.date.split('-')[0]}
//                     className="font-semibold"
//                   >
//                     {caseStudy.date.split('-')[0]}
//                   </time>
//                   <span className="text-neutral-300" aria-hidden="true">
//                     /
//                   </span>
//                   <span>Case study</span>
//                 </p>
//                 <p className="mt-6 font-display text-2xl font-semibold text-neutral-950">
//                   {caseStudy.title}
//                 </p>
//                 <p className="mt-4 text-base text-neutral-600">
//                   {caseStudy.description}
//                 </p>
//               </article>
//             </FadeIn>
//           ))}
//         </FadeInStagger>
//       </Container>
//     </>
//   )
// }

type ServicesProps = {
  invert?: boolean
}
const Services: React.FC<ServicesProps> = ({ invert }) => {
  return (
    <>
      <FadeIn>
        <SectionIntro
          eyebrow="Services"
          title="We help streamline and automate your engineering processes."
          className="mt-10 lg:mt-20"
          invert={invert}
        >
          <p>
            At Aboni Tech, we specialize in connecting departments through automation, utilizing industry-standard software like Autodesk Inventor and Solidworks to ensure seamless integration and improved efficiency.
          </p>
        </SectionIntro>
      </FadeIn>
      <Container className="sm:mt-0 lg:mt-10">
        <div className="lg:flex lg:items-center lg:justify-end">
          <div className="flex justify-center lg:w-1/2 lg:justify-end lg:pr-12">
            <FadeIn className="w-[33.75rem] flex-none lg:w-[45rem] lg:pb-20">
              <StylizedImage
                src={imageLaptop}
                sizes="(min-width: 1024px) 41rem, 31rem"
                className="justify-center lg:justify-end"
              />
            </FadeIn>
          </div>
          <List className="mt-16 lg:mt-0 lg:w-1/2 lg:min-w-[33rem] lg:pl-4 pb-20 text-neutral-200">
            <ListItem title="Engineering Automation">
              We excel in automating engineering processes using tools like Autodesk Inventor and Solidworks, saving time and reducing errors.
            </ListItem>
            <ListItem title="Process Optimization">
              Our expertise lies in streamlining workflows by connecting different departments, ensuring data consistency and operational efficiency.
            </ListItem>
            <ListItem title="Custom Integrations">
              We create custom software solutions to integrate your existing systems, facilitating seamless communication across your company.
            </ListItem>
            <ListItem title="Technical Consulting">
              At Aboni Tech, we provide consulting services to help you identify and implement the best technology solutions for your engineering challenges.
            </ListItem>
          </List>
        </div>
      </Container>
    </>
  )
}

export const metadata: Metadata = {
  description:
    'Aboni Tech is a software development company focusing on automating engineering processes using Autodesk Inventor, Solidworks, and other common apps.',
}

export default async function Home() {
  // let caseStudies = (await loadCaseStudies()).slice(0, 3)

  return (
    <>
      <Container className="mt-28 sm:mt-34 md:mt-54">
        <FadeIn className="max-w-3xl">
          <h1 className="font-display text-5xl font-medium tracking-tight text-neutral-950 [text-wrap:balance] sm:text-7xl">
            Leading the way in engineering automation and process optimization.
          </h1>
          <p className="mt-6 text-xl text-neutral-600">
            Aboni Tech is dedicated to transforming engineering through automation. Our solutions bridge the gap between departments, driving efficiency and innovation.
          </p>
        </FadeIn>
      </Container>

      {/* <Clients /> */}
      <ServicesDark />

      {/* <CaseStudies caseStudies={caseStudies} /> */}

      <Testimonial
        className=""
        client={{ name: 'Maxcess', logo: logoMaxcess }}
      >
        Their attention to detail has helped my group in creating, debugging and producing a quality ETO product for Tidland.
        I have found Aboni Tech to be helpful, insightful and willing to do what they can to help the company.
      </Testimonial>

      {/* <Services /> */}

      <ContactSection />
    </>
  )
}

