# Data Model: Import Outline Modal

## ImportOutlineRequest

- **mode**: "preview" | "create"
- **file**: .docx document (multipart form data field)
- **storyName**: string | null (optional, used for create)

## ImportOutlineSummary

- **acts**: array of ActSummary
- **chapters**: array of ChapterSummary
- **scenes**: array of SceneSummary
- **sections**: array of SectionSummary
- **povMarkers**: array of PovMarkerSummary
- **tags**: array of TagSummary
- **counts**: summary counts for each object type

## ActSummary

- **title**: string
- **chapterCount**: number

## ChapterSummary

- **title**: string
- **sceneCount**: number
- **actTitle**: string | null

## SceneSummary

- **title**: string
- **chapterTitle**: string | null
- **actTitle**: string | null

## SectionSummary

- **title**: string | null
- **paragraphCount**: number
- **parentHeading**: string | null

## PovMarkerSummary

- **character**: string
- **sceneTitle**: string | null

## TagSummary

- **tag**: string
- **sceneTitle**: string | null

## ImportOutlineResult

- **mode**: "preview" | "create"
- **summary**: ImportOutlineSummary
- **message**: string | null
- **storyId**: string | null

## Notes

- For this phase, the API returns a placeholder summary with TODO content.
- The summary schema is forward-compatible with a later parser implementation.
