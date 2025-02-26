const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const fs = require('node:fs');
const session = require('express-session');
const cookieParser = require("cookie-parser");
const { EventEmitter } = require('events');

let openai_apikey = process.env.OPENAI_APIKEY;
let openai_projectid = process.env.OPENAI_PROJECTID;
let openai_assistantid = process.env.OPENAI_ASSISTANTID;

//const os = require('os');
//const hostname = os.hostname();
//console.log('Hostname:', hostname);

const openai = new OpenAI({
    apiKey: openai_apikey,
    project_id: openai_projectid
});

//console.log('start openai')

let assistantId = openai_assistantid;

const systemSetup = "Who are you? I'm Sara, which stands for Summit Avatar Resources Applications. With our product VideoTwin we make of you the best digital copy possible."

const sessionEvents = new EventEmitter();
let activeSessions = new Map(); // Track active sessions

// Define the main route
router.get('/', async (req, res) => {
    res.send('this is an openai route..');// this gets executed when user visit http://localhost:3000/user
});

router.get('/test', async (req, res) => {
    //console.log('server api request received');
    res.status(200).json({ result: 'test vanuit de root..' });
})

// Define the 'ask' route
router.post('/ask', async (req, res) => {

    // console.log('ask openai');
    try {
        //console.log(req.body.prompt);
        let result = await AskOpenAi(req.body.prompt).then(function (result) {

            //console.log(result);
            res.send(result);
        });
    } catch (error) {
        console.error('Error calling OpenAI:', error);
        res.status(500).send('Error processing your request');
    }

});


const gptVersions = ['gpt-4o-mini', 'gpt-4o'];
const gptSelectedVersion = gptVersions[0];

//console.log(gptSelectedVersion);

// Call OpenAI for getting information
const AskOpenAi = async (input) => {

    //console.log('ask openai ' + new Date())
    const chatCompletion = await openai.chat.completions.create({
        messages: [
            { role: 'system', content: systemSetup },
            { role: 'user', content: input }
        ],
        //model: 'gpt-3.5-turbo'
        model: gptSelectedVersion
    });

    //console.log(chatCompletion.choices[0].message.content);
    let output = { text: chatCompletion.choices[0].message.content };

    //console.log('return openai ' + new Date())
    return output;
}

// Start assistent functions
// Define the assistent route
router.get('/assistent', async (req, res) => {

    res.send(`this is the main assistent route ${thread.id}`);// this gets executed when user visit http://localhost:3000/user
});

router.get('/thread', (req, res) => {

    //console.log('start thread');
    //console.log(currentThreadId);

    if (currentThreadId === 'unknown') {
        createThread().then(thread => {
            currentThreadId = thread.id
        });
    }

    //console.log('return thread');
    //console.log(currentThreadId);


    res.json({ threadId: currentThreadId });
})


let currentThreadId = null;
let pollingInterval = null;

router.post('/message', async (req, res) => {

    //update assistantId

    if (req.session.assistantId) {
        assistantId = req.session.assistantId;
    }


    console.log('ask openai with assistantId');
    //console.log(req.session.assistantId);
    //console.log('..finished asking');
    //const { message, threadId } = req.body;
    //console.log('messsag');

    if (currentThreadId === null) {
        const thread = await createThread();
        currentThreadId = thread.id;
    }

    // Reset timeout on new message
    startSessionTimeout(currentThreadId);

    const threadId = currentThreadId;

    let message = req.body.prompt;
    //console.log(message);

    await addMessage(threadId, message).then(message => {
        // Run the assistant
        let result = runAssistant(threadId).then(run => {
            const runId = run.id;

            // Clear any existing interval first
            if (pollingInterval) {
                clearInterval(pollingInterval);
            }

            // Check the status
            pollingInterval = setInterval(() => {
                checkingStatus(res, threadId, runId);
            }, 600);
        });
    });

});

// Set up a Thread

async function createThread() {
    //console.log('Creating a new thread...');
    let thread = await openai.beta.threads.create();
    return thread;
}

// Add message
async function addMessage(threadId, message) {
    //console.log('Adding a new message to thread: ' + threadId);
    const response = await openai.beta.threads.messages.create(
        threadId,
        {
            role: "user",
            content: message
        }
    );
    return response;
}

// Run the assistant
async function runAssistant(threadId) {

    //console.log('Running assistant for thread: ' + threadId)
    console.log('AssistantID ' + assistantId)

    const response = await openai.beta.threads.runs.create(
        threadId,
        {
            assistant_id: assistantId
            // Make sure to not overwrite the original instruction, unless you want to
        }
    );

    //console.log(response)

    return response;
}

async function checkingStatus(res, threadId, runId) {
    try {
        const runObject = await openai.beta.threads.runs.retrieve(threadId, runId);
        const status = runObject.status;
        
        console.log('Current status: ' + status);

        if (status === 'completed') {
            clearInterval(pollingInterval);
            pollingInterval = null; // Prevent further execution

            const messagesList = await openai.beta.threads.messages.list(threadId);
            let messages = messagesList.body.data.map(msg => msg.content);

            if (messages.length === 0 || !messages[0][0]?.text?.value) {
                return res.status(500).json({ error: 'No response from assistant' });
            }

            let answerText = messages[0][0].text.value;

            if (!res.headersSent) {  // ✅ Ensure response hasn't been sent
                return res.json({ text: answerText });
            }
        }
    } catch (error) {
        console.error("Error in checkingStatus:", error);

        if (!res.headersSent) {  // ✅ Prevent duplicate responses
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}


function countWords(str) {

    str = str.replace(/(^\s*)|(\s*$)/gi, "");//remove first and last space
    str = str.replace(/[ ]{2,}/gi, " ");//convert multiple spaces in row to single space
    str = str.replace(/\n /, "\n"); // exclude newline with a start spacing
    return str.split(' ').filter(function (str) { return str != ""; }).length;

}

function removeSourceText(input) {

    let findStr = '【';
    let indexChar = input.indexOf(findStr);
    let containsChar = (indexChar > 0) ? true : false;

    if (containsChar) {
        return input.substring(0, indexChar - 1) + '.';
    }

    return input;
}

// Add these new routes/functions
router.post('/end-session', async (req, res) => {
  try {
    const { sessionId, reason } = req.body;
    
    await handleSessionEnd(currentThreadId, reason);
    
    // Clear any existing timeout
    if (activeSessions.has(currentThreadId)) {
      clearTimeout(activeSessions.get(currentThreadId));
      activeSessions.delete(currentThreadId);
    }
    
    res.json({ status: 'success' });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

async function handleSessionEnd(threadId, reason) {
  if (!threadId) return;

  try {
    // Mock webhook payload
    const webhookPayload = {
      thread_id: threadId,
      event: 'conversation_end',
      user_email: 'user@example.com', // Mock email for demo
      reason: reason
    };

    // Mock webhook call
    console.log('Webhook called with payload:', webhookPayload);
    
    // Clear the thread ID and session
    currentThreadId = null;
    activeSessions.delete(threadId);

  } catch (error) {
    console.error('Error in webhook call:', error);
    // You might want to retry the webhook call here
  }
}

// Add session timeout handling
function startSessionTimeout(threadId) {
  // Clear any existing timeout
  if (activeSessions.has(threadId)) {
    clearTimeout(activeSessions.get(threadId));
  }

  // Set new timeout - 10 minutes
  const timeout = setTimeout(async () => {
    await handleSessionEnd(threadId, 'timeout');
    activeSessions.delete(threadId);
  }, 10 * 60 * 1000); // Back to 10 minutes

  activeSessions.set(threadId, timeout);
}

// Clean up on server shutdown
process.on('SIGTERM', () => {
  activeSessions.forEach((timeout) => clearTimeout(timeout));
});


// export the router module so that server.js file can use it
module.exports = router;