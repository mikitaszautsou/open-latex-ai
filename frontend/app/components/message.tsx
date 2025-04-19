import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { ROLE } from '~/services/chat-api';

export type MessageProps = {
    author: string;
    message: string;
    role: ROLE;
}

export function Message({ author, message, role }: MessageProps) {
    return (
        <div className={clsx('flex p-2.5 rounded-sm', role === ROLE.USER ? 'bg-[#2886fe] text-white' : 'bg-[#efefef]')}>
            <div className='hidden md:flex justify-center items-center bg-[#F1E7E7] rounded-md min-w-[60px] max-w-[60px] min-h-[60px] max-h-[60px] text-[40px]' >{role === ROLE.USER ? '👦🏻' : '🤖'}</div>
            <div className='pl-2 w-full overflow-hidden'>
                <div className="font-semibold">{author}</div>
                <div className="dark:prose-invert max-w-none markdown-content prose">
                    <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                            // Add syntax highlighting for code blocks
                            code({ node, inline, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '');
                                const language = match ? match[1] : '';
                                
                                return !inline && match ? (
                                    <SyntaxHighlighter
                                        language={language}
                                        PreTag="div"
                                        {...props}
                                    >
                                        {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                ) : (
                                    <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded-sm" {...props}>
                                        {children}
                                    </code>
                                );
                            },
                            a: ({ node, ...props }) => (
                                <a className="text-blue-600 dark:text-blue-400 hover:underline" {...props} />
                            ),
                        }}
                    >
                        {message}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}