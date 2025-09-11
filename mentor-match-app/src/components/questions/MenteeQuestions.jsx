import { Stack, Typography } from '@mui/material'
import TextfieldQuestion from './TextfieldQuestion'
import CheckboxQuestion from './CheckboxQuestion'
import RadioQuestion from './RadioQuestion'

const MenteeQuestions = ({ isCombinedForm = false, disabled = false }) => {
  return (
    <Stack spacing={2}>
      <Typography variant="h6">
        Mentee Details / Detalles del Mentee / Detalhes do Mentee
      </Typography>
      <RadioQuestion
        question={`What do you hope to achieve in this area through the mentorship? / ¿Qué esperas lograr en esa área a través de la mentoría? / O que você espera alcançar nessa área por meio da mentoria?`}
        description="Select your top choice / Selecciona tu opción prioritaria / Selecione sua opção prioritária"
        options={[
          'Receive detailed feedback on a research paper or project / Recibir retroalimentación detallada sobre un artículo o proyecto / Receber feedback detalhado sobre um artigo ou projeto',
          'Prepare a submission for a conference (e.g., CVPR, ICML, NeurIPS) / Preparar una presentación para una conferencia (por ejemplo, NeurIPS) / Preparar uma submissão para uma conferência (por exemplo, NeurIPS)',
          'Understand career options and receive guidance / Comprender opciones profesionales y recibir orientación / Entender opções de carreira e receber orientação',
          'Learn best practices and tools in the area / Aprender mejores prácticas y herramientas en el área / Aprender boas práticas e ferramentas na área',
          'Build a lasting connection with a mentor in the field / Crear una conexión duradera con un mentor en el campo / Construir uma conexão duradoura com um mentor na área'
        ]}
        spacing={1.5}
        name={'mentorshipAspirations'}
        disabled={disabled}
      />
      <TextfieldQuestion
        question="(LINK) Commitment & Motivation statement / Declaración de Compromiso y Motivación / Declaração de Compromisso e Motivação (1-page pdf)"
        description={`We want to understand your motivation for applying and your awareness of the responsibility and commitment to the program & mentors. The statement can be written in English, Portuguese or Spanish.\n\nQueremos comprender su motivación para postularse y su conciencia de la responsabilidad y el compromiso con el programa y los mentores. La declaración puede estar escrita en inglés, portugués o español. \n\nQueremos entender sua motivação para se inscrever e sua consciência da responsabilidade e compromisso com o programa e mentores. A declaração pode ser redigida em inglês, português ou espanhol.`}
        name={'commitmentStatement'}
        disabled={disabled}
      />
      <TextfieldQuestion
        question="Briefly define your profile and your best professional/academic characteristics / Define brevemente tu perfil y tus mejores características profesionales/académicas. / Defina brevemente seu perfil e suas melhores características profissionais/acadêmicas"
        name={'menteeProfile'}
        disabled={disabled}
      />
      {!isCombinedForm && (
        <RadioQuestion
          question="How many research papers have you written or contributed to? / ¿Cuántos artículos de investigación has escrito o en cuántos has contribuido? / Quantos artigos de pesquisa você escreveu ou contribuiu?"
          description={`If you haven’t written or contributed to a paper yet, that’s completely fine! This program is here to support you in developing your first research paper \n\nSi aún no has escrito ni contribuido a un artículo, ¡no hay problema! Este programa está diseñado para apoyarte en el desarrollo de tu primer trabajo de investigación \n\nSe você ainda não escreveu ou contribuiu para um artigo, não tem problema! Este programa foi criado para ajudá-lo a desenvolver seu primeiro trabalho de pesquisa`}
          options={[
            '0 – I haven’t written a paper yet, but I’m eager to learn!',
            '1-3 – I have some experience and want to improve.',
            '3-5 – I have moderate experience and want to refine my skills.',
            '5+ – I have extensive experience and want to enhance my writing further'
          ]}
          name={'academicPapers'}
          disabled={disabled}
        />
      )}
      <RadioQuestion
        question="Have you submitted a paper to a peer-reviewed AI conference or journal before?  / ¿Has enviado un artículo a una conferencia o revista de IA con revisión por pares anteriormente? / Você já enviou um artigo para uma conferência ou revista de IA com revisão por pares antes?"
        description={`If not, no worries! This program will help you gain the experience needed for future submissions. \n\nSi no, ¡no te preocupes! Este programa te ayudará a adquirir la experiencia necesaria para futuras postulaciones. \n\nSe não, não se preocupe! Este programa vai ajudá-lo a ganhar a experiência necessária para futuras submissões.`}
        options={['Yes', 'No']}
        name={'submittedInAiConferences'}
        disabled={disabled}
      />
      <TextfieldQuestion
        question="If Yes, please specify which ones  / Si es así, por favor especifica cuáles. / Se sim, por favor especifique quais"
        name={'submittedPapers'}
        required={false}
        disabled={disabled}
      />
      <CheckboxQuestion
        question={`Are you planning to submit your research paper to the LatinX in AI Workshop (or an upcomming workshop at a conference), or to the main track top-tier AI conference in the near future? /
¿Planeas enviar tu artículo de investigación al Taller de LatinX en IA de NeurIPS, o a una conferencia de IA de alto nivel en un futuro cercano? / Você planeja enviar seu artigo de pesquisa para o Workshop de LatinX em IA no NeurIPS ou para uma conferência de IA de alto nível em um futuro próximo?`}
        options={[
          'LatinX in AI Workshop @ CVPR, ICML or NeurIPS 2026',
          'Academic Workshop @ Top-tier AI conference',
          'Main track - Top-tier AI conference (e.g., NeurIPS, ICML, CVPR, ACL, etc.)',
          'I am not planning to submit a research paper in the near future',
          'Other'
        ]}
        name={'planningToSubmit'}
        required={false}
        disabled={disabled}
      />
      <TextfieldQuestion
        question={`What career goals do you want to achieve in the next three years? / ¿Qué objetivos profesionales quieres alcanzar en los próximos tres años? / Quais objetivos de carreira você deseja alcançar nos próximos três anos?"`}
        name={'careerGoals'}
        disabled={disabled}
      />
      <Typography variant="h6">
        Strengthening skills / Fortalecimiento de habilidades / Fortalecimento
        de habilidades
      </Typography>
      <CheckboxQuestion
        question="What are the skills you are interested in being mentored? / ¿En qué habilidades te interesa recibir mentoría? / Em quais habilidades você tem interesse em receber mentoria?"
        description="Choose up to 2 options / Elige hasta 2 opciones / Escolha até 2 opções"
        name={'mentoredSkills'}
        options={[
          'Writing & Communication (e.g., research papers, technical writing, presentations)',
          'Coding & Software Engineering (e.g., ML frameworks, best practices, debugging)',
          'Experimentation & Reproducibility (e.g., designing experiments, hyperparameter tuning)',
          'AI Ethics & Responsible AI (e.g., bias mitigation, fairness in AI)',
          'Networking & Personal Branding (e.g., building an AI career, conferences, social media presence)',
          'Public Speaking & Teaching (e.g., giving talks, mentoring others)',
          'Project Management & Collaboration (e.g., working in teams, leading AI projects)',
          'Other'
        ]}
        disabled={disabled}
      />
      <Typography variant="h6">
        Research Guidance (AI Verticals) / Orientación en Investigación
        (Verticales de IA) / Orientação em Pesquisa (Verticais de IA)
      </Typography>
      <CheckboxQuestion
        question="What are the research areas you are interested in being mentored? / ¿En qué áreas de investigación te interesa recibir mentoría? / Em quais áreas de pesquisa você tem interesse em receber mentoria?"
        description="Choose up to 3 options / Elige hasta 3 opciones / Escolha até 3 opções"
        name={'researchAreas'}
        options={[
          'General Machine Learning/Artificial Intelligence',
          'Computer Vision',
          'Natural Language Processing',
          'Graph ML',
          'Generative Models',
          'Multimodal AI',
          'Representation Learning',
          'Reinforcement Learning',
          'Large Language Models',
          'AI Agents',
          'Fairness / Explainability'
        ]}
        disabled={disabled}
      />
      <CheckboxQuestion
        question="Do you work in a specific research field or application domain? / ¿Trabajas en un campo de investigación o dominio de aplicación específico? / Você trabalha em uma área de pesquisa ou domínio de aplicação específico?"
        options={[
          'General ML Theory and Research',
          'Finance and Investing',
          'Technology and Services',
          'Medicine and Biology',
          'Robotics and Automation',
          'Science (Physics, Chemistry, Materials Science)',
          'Art and Creativity',
          'Environmental Science'
        ]}
        name={'menteeFields'}
        disabled={disabled}
      />
    </Stack>
  )
}

export default MenteeQuestions
