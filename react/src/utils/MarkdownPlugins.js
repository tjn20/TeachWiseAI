import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkBreaks from "remark-breaks";
import remarkBehead from "remark-behead";
import { remarkCodeBlock } from "remark-code-block";
import remarkCodeTitle from "remark-code-title";
import remarkExtendedTable from "remark-extended-table";
import remarkHeadingGap from "remark-heading-gap";
import rehypeHighlight from "rehype-highlight";
import rehypeMinifyWhitespace from "rehype-minify-whitespace";
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'; // For rendering raw HTML


export const REMARK_PLUGINS = [remarkGfm,remarkMath,remarkBreaks]
export const REHYPE_PLUGINS = [[rehypeKatex, { displayMode: true,strict:false }]]
