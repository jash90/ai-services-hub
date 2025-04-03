import { ModelGrok } from '../grok/modelGrok';
import { ModelOpenAIVision } from '../openAi/ModelOpenAIVision';

export type GlobalInstanceVisionModel = ModelOpenAIVision | typeof ModelGrok.grok2Vision | string;
