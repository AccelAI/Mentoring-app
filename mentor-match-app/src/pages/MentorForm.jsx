import { Container, Box, Typography, Stack } from "@mui/material";
import FormCard from "../components/FormCard";
import TextfieldQuestion from "../components/questions/text/TextfieldQuestion";
import RadioQuestion from "../components/questions/RadioQuestion";
import CheckboxQuestion from "../components/questions/checkbox/CheckboxQuestion";
import { LoadingButton } from "@mui/lab";
import { Form, Formik } from "formik";
import * as yup from "yup";

const initialValues = {
  currentInstitution: "",
  currentPosition: "",
  linkToResearch: "",
  preferredTimezone: "",
  otherMenteePref: "",
  otherExpectations: "",
  otherConferences: "",
  languages: [],
  mentorMotivation: "",
  mentorArea: [],
  mentoringTime: "",
  menteePreferences: [],
  preferredExpectations: [],
  openToDiscussImpacts: "",
  mentorSkills: [],
};

const schema = yup.object().shape({
  currentInstitution: yup
    .string()
    .required("Please enter your current institution"),
  currentPosition: yup.string().required("Please enter your current position"),
  linkToResearch: yup
    .string()
    .url("Invalid URL")
    .required("Please enter a link"),
  preferredTimezone: yup
    .string()
    .required("Please enter your preferred timezone"),
  otherMenteePref: yup.string(),
  otherExpectations: yup.string(),
  otherConferences: yup.string(),
  languages: yup.array().min(1, "Please select at least one language"),
  mentorMotivation: yup.string().required("Please select an option"),
  mentorArea: yup.array().min(1, "Please select at least one area"),
  mentoringTime: yup.string().required("Please select an option"),
  menteePreferences: yup
    .array()
    .min(1, "Please select at least one preference"),
  preferredExpectations: yup
    .array()
    .min(1, "Please select at least one option"),
});

const MentorForm = () => {
  const onSubmit = async (values, { setSubmitting }) => {
    setSubmitting(true);
    console.log(values);
    setSubmitting(false);
  };
  return (
    <FormCard
      enableContainer={true}
      props={{ height: "100vh" }}
      title={"LXAI Mentor Application Form"}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={schema}
        onSubmit={onSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <Stack spacing={3}>
              <TextfieldQuestion
                question="Current Institution, Company or Organization Affiliation"
                description="Where do you study or work? | ¿Dónde estudias o trabajas? | Onde você estuda ou trabalha?"
                name={"currentInstitution"}
              />
              <RadioQuestion
                question="Current Seniority Level"
                description="What is your highest level of education or working experience? | ¿Cuál es su nivel más alto de educación o experiencia laboral? | Qual é o seu nível mais alto de educação ou experiência de trabalho?"
                options={[
                  "Post Doc or Early Career PhD",
                  "Faculty Member",
                  "Senior Industry or Academic Researcher",
                  "Management / Business Professional",
                ]}
                name={"currentPosition"}
              />
              <TextfieldQuestion
                question="Link to Google scholar (preferred), website or LinkedIn page."
                description="Share a link to your current research publications or industry achievements. | Comparta un enlace a sus publicaciones de investigación actuales o logros académicos / industriales. | Compartilhe um link para suas publicações de pesquisa atuais ou realizações acadêmicas / industriais."
                name={"linkToResearch"}
              />
              <CheckboxQuestion
                question="What language(s) do you speak?"
                description=""
                options={["English", "Spanish", "Portuguese", "French"]}
                name={"languages"}
              />
              <TextfieldQuestion
                question="What is your preferred timezone for meetings?"
                description="We'll do our best to match you with a mentee available in a similar timezone."
                name={"preferredTimezone"}
              />
              <RadioQuestion
                question="Mentor Motivation. Have you served as a Mentor previously?"
                description=""
                name={"mentorMotivation"}
                options={[
                  "Yes, with LatinX in AI",
                  "Yes, with another organization",
                  "No",
                ]}
              />
              <CheckboxQuestion
                question="Which area do you prefer to mentor?"
                description="Where can you provide the most guidance in order for mentees to reach their short term goals?"
                name={"mentorArea"}
                options={[
                  "Strengthening skills (Writing or Communication or Engineering)",
                  "Research Guidance (AI Verticals)",
                  "Improve as a Reviewer of Research Papers",
                ]}
              />
              <RadioQuestion
                question="How much time do you have available for mentoring?"
                description=""
                name={"mentoringTime"}
                options={[
                  "1 hour per month",
                  "2 hours per month",
                  "3 hours per month",
                  "4 hours per month",
                ]}
              />
              <CheckboxQuestion
                question="Do have any specific preferences for a mentee?"
                description="We will do our best to match you with mentees who meet your preferences. This is not guaranteed as we weigh the mentee's preferences over the mentor's preferences when matching candidates."
                name={"menteePreferences"}
                options={[
                  "Similar Demographic Area (Country or Region of the World)",
                  "At least 1 Peer-Reviewed Publication in a Journal, Conference, or Workshop",
                  "Early Career Academic Professional",
                  "Early Career Industry Professional",
                  "Ph.D. or Post-Doc",
                  "Graduate School",
                  "Undergrad",
                  "Other",
                ]}
              />
              <TextfieldQuestion
                question="If you answered other to the question above, please elaborate."
                description=""
                name={"otherMenteePref"}
                required={false}
              />
              <CheckboxQuestion
                question="What are your preferred expectations and outcomes from this program?"
                description=""
                name={"preferredExpectations"}
                options={[
                  "Improve your experience and career level by mentoring others",
                  "Establish a research collaboration",
                  "Co-author research with a mentee",
                  "Hire entry-level candidates",
                  "Other",
                ]}
              />
              <TextfieldQuestion
                question="If you answered other to the question above, please elaborate."
                description=""
                name={"otherExpectations"}
                required={false}
              />
              <RadioQuestion
                question="Are you open to discuss/enumerate the impacts of the program with organizers in the future?"
                description="We may ask you to provide a public testimonial if this program has helped you in achieving your and your mentees goals."
                name={"openToDiscussImpacts"}
                options={["Yes", "No"]}
                required={false}
              />
              <Box>
                <Typography variant="h6">Strengthening Skills</Typography>
                <Typography>
                  Only for those who checked this option on the mentoring
                  preferences
                </Typography>
              </Box>
              <CheckboxQuestion
                question="What skills do you want to help mentees to improve?"
                description=""
                name={"mentorSkills"}
                options={[
                  "Presenting (Verbal Communication of research)",
                  "Writing Research Papers",
                  "Finding papers related to my area of research",
                  "Engineering to improve research outcomes",
                ]}
                required={false}
              />
              <TextfieldQuestion
                question="If you answered other to the question above, please elaborate."
                description=""
                name={"otherConferences"}
                required={false}
              />

              <LoadingButton
                variant="contained"
                type="submit"
                sx={{ width: "100%" }}
                loading={isSubmitting}
              >
                Submit
              </LoadingButton>
            </Stack>
          </Form>
        )}
      </Formik>
    </FormCard>
  );
};

export default MentorForm;
