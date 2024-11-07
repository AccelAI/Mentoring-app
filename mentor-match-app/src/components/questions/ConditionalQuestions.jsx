import React from "react";
import { useFormikContext } from "formik";
import { Box, Stack, Typography } from "@mui/material";
import CheckboxQuestion from "./checkbox/CheckboxQuestion";
import RadioQuestion from "./RadioQuestion";

const ConditionalQuestions = () => {
  const { values } = useFormikContext();
  const { mentorArea } = values;

  return (
    <>
      {mentorArea.includes(
        "Strengthening skills (Writing or Communication or Engineering)"
      ) && (
        <Stack spacing={2}>
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
            name="mentorSkills"
            options={[
              "Presenting (Verbal Communication of research)",
              "Writing Research Papers",
              "Finding papers related to my area of research",
              "Engineering to improve research outcomes",
            ]}
            required={false}
          />
        </Stack>
      )}
      {mentorArea.includes("Research Guidance (AI Verticals)") && (
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6">
              Research Guidance (AI Verticals)
            </Typography>
            <Typography>
              Only for those who checked this option on the mentoring
              preferences
            </Typography>
          </Box>
          <CheckboxQuestion
            question="What are the research areas you can consider mentoring?"
            description="Choose up to 3 options | Elija hasta 3 opciones | Escolha até 3 opções"
            name="areasConsideringMentoring"
            options={[
              "Reinforcement Learning",
              "Deep Learning (Architectures / Datasets / Evaluation)",
              "Learning Theory (Bandits / Experts / Game Theory)",
              "Probabilistic Inference / Bayesian Methods / Graphical Models / Causality",
              "Machine Learning (Supervised / Semi-Supervised / Online / Active / Low-shot Learning)",
              "Natural Language Processing / Natural Language Understanding",
              "Explainable AI / Fairness / Accountability / Privacy / Transparency / Ethics",
              "Representation Learning / Unsupervised Feature Learning",
              "Computer Vision Detection / Localization / Recognition",
              "Multi-Modal Learning (Vision + Language + Other Modalities)",
              "Optimization Methods",
              "Generative Models",
            ]}
            required={false}
          />
        </Stack>
      )}
      {mentorArea.includes("Improve as a Reviewer of Research Papers") && (
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6">Reviewing Research Papers</Typography>
            <Typography>
              Only for those who checked this option on the mentoring
              preferences
            </Typography>
          </Box>
          <RadioQuestion
            question="Have you served as a reviewer in a research workshop before?"
            description=""
            name="reviewerInWorkshop"
            options={["Never", "1-2 Times", "3-5 Times", "More than 5 times"]}
            required={false}
          />
          <RadioQuestion
            question="Do you have peer-reviewed publications in workshop(s)?"
            description=""
            name="publicationsInWorkshop"
            options={["Yes", "No"]}
            required={false}
          />
          <RadioQuestion
            question="Have you served as a reviewer in top-tier AI conferences?"
            description="Examples include CVPR / ICCV / ECCV / NeurIPS / ICML / ACL / ICLR"
            name="reviewerInAiConferences"
            options={["Never", "1-2 Times", "3-5 Times", "More than 5 times"]}
            required={false}
          />
          <RadioQuestion
            question="Do you have peer-reviewed publications in top-tier AI conferences?"
            description="Examples include CVPR / ICCV / ECCV / NeurIPS / ICML / ACL / ICLR"
            name="publicationsInAiConferences"
            options={["Yes", "No"]}
            required={false}
          />
          <RadioQuestion
            question="Have you served as a reviewer in AI journals of high impact?"
            description=""
            name="reviewerInAiJournals"
            options={["Never", "1-2 Times", "3-5 Times", "More than 5 times"]}
            required={false}
          />
          <RadioQuestion
            question="Do you have peer-reviewed publications in AI journals of high impact?"
            description=""
            name="publicationsInAiJournals"
            options={["Yes", "No"]}
            required={false}
          />
        </Stack>
      )}
    </>
  );
};

export default ConditionalQuestions;
