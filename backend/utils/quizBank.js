/**
 * PeerSync Skill Assessment Quiz — Question Bank
 *
 * 8 MCQ questions per subject. Each question has:
 *   - q:       question text
 *   - opts:    4 answer options
 *   - ans:     index of correct answer (0-3)
 *   - level:   'basic' | 'intermediate' | 'advanced'
 */

const QUESTION_BANK = {

  'Data Structures': [
    { q: 'What is the time complexity of searching in a balanced BST?', opts: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], ans: 1, level: 'basic' },
    { q: 'Which data structure uses LIFO ordering?', opts: ['Queue', 'Stack', 'Heap', 'Deque'], ans: 1, level: 'basic' },
    { q: 'What is the worst-case time complexity of quicksort?', opts: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'], ans: 2, level: 'intermediate' },
    { q: 'In a min-heap, the root always contains the ___?', opts: ['Maximum element', 'Minimum element', 'Median element', 'Last inserted'], ans: 1, level: 'basic' },
    { q: 'Which traversal of a BST gives sorted output?', opts: ['Pre-order', 'Post-order', 'In-order', 'Level-order'], ans: 2, level: 'basic' },
    { q: 'What is the space complexity of merge sort?', opts: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], ans: 2, level: 'intermediate' },
    { q: 'Which graph algorithm finds the shortest path in an unweighted graph?', opts: ['DFS', 'BFS', 'Dijkstra', 'Bellman-Ford'], ans: 1, level: 'intermediate' },
    { q: 'A hash table has average O(1) lookup. What causes worst-case O(n)?', opts: ['Overflow', 'Hash collisions', 'Empty slots', 'Large keys'], ans: 1, level: 'advanced' },
  ],

  'Machine Learning': [
    { q: 'What does "overfitting" mean in ML?', opts: ['Model performs well on new data', 'Model memorizes training data too well', 'Model has too few parameters', 'Model fails to train'], ans: 1, level: 'basic' },
    { q: 'Which activation function outputs values between 0 and 1?', opts: ['ReLU', 'Tanh', 'Sigmoid', 'Linear'], ans: 2, level: 'basic' },
    { q: 'What does the bias-variance tradeoff describe?', opts: ['Speed vs accuracy', 'Underfitting vs overfitting', 'Training vs test error', 'Precision vs recall'], ans: 1, level: 'intermediate' },
    { q: 'In k-fold cross-validation with k=5, what fraction is used for validation?', opts: ['1/3', '1/4', '1/5', '1/2'], ans: 2, level: 'intermediate' },
    { q: 'Random Forest is an ensemble of ___?', opts: ['SVMs', 'Neural networks', 'Decision trees', 'Linear models'], ans: 2, level: 'basic' },
    { q: 'What metric is best for imbalanced classification?', opts: ['Accuracy', 'F1-Score', 'MSE', 'R²'], ans: 1, level: 'intermediate' },
    { q: 'Gradient descent minimizes a function by moving in the direction of ___?', opts: ['Gradient', 'Negative gradient', 'Second derivative', 'Zero gradient'], ans: 1, level: 'intermediate' },
    { q: 'What is the purpose of dropout in neural networks?', opts: ['Speed up training', 'Reduce overfitting', 'Increase accuracy', 'Normalize inputs'], ans: 1, level: 'advanced' },
  ],

  'Web Development': [
    { q: 'Which HTTP method is used to retrieve data from a server?', opts: ['POST', 'PUT', 'GET', 'DELETE'], ans: 2, level: 'basic' },
    { q: 'What does CSS "box model" include?', opts: ['Content, padding, border, margin', 'Header, body, footer', 'Div, span, p', 'HTML, CSS, JS'], ans: 0, level: 'basic' },
    { q: 'What is the output of: typeof null in JavaScript?', opts: ['"null"', '"undefined"', '"object"', '"boolean"'], ans: 2, level: 'intermediate' },
    { q: 'What does REST stand for?', opts: ['Remote Entry System Transfer', 'Representational State Transfer', 'Reliable Event Stream Technology', 'Request-Event State Transfer'], ans: 1, level: 'basic' },
    { q: 'Which React hook is used for side effects?', opts: ['useState', 'useEffect', 'useContext', 'useRef'], ans: 1, level: 'intermediate' },
    { q: 'What does "async/await" do in JavaScript?', opts: ['Blocks the thread', 'Handles asynchronous code synchronously', 'Creates threads', 'Speeds up execution'], ans: 1, level: 'intermediate' },
    { q: 'What does CORS stand for?', opts: ['Client Origin Resource Security', 'Cross-Origin Resource Sharing', 'Cross-Origin Request System', 'Common Object Resource Schema'], ans: 1, level: 'intermediate' },
    { q: 'What is a closure in JavaScript?', opts: ['A function with no params', 'A function that captures its lexical scope', 'An anonymous function', 'A class method'], ans: 1, level: 'advanced' },
  ],

  'Calculus': [
    { q: "What is the derivative of x²?", opts: ['x', '2x', 'x²', '2'], ans: 1, level: 'basic' },
    { q: 'What is the integral of 1/x dx?', opts: ['x', 'ln|x| + C', '1/x² + C', 'e^x + C'], ans: 1, level: 'basic' },
    { q: "What does L'Hôpital's rule help evaluate?", opts: ['Definite integrals', 'Limits of 0/0 or ∞/∞ forms', 'Taylor series', 'Partial derivatives'], ans: 1, level: 'intermediate' },
    { q: 'The chain rule is used to differentiate ___?', opts: ['Sums', 'Products', 'Composite functions', 'Quotients'], ans: 2, level: 'basic' },
    { q: 'What is the second derivative test used for?', opts: ['Finding zeros', 'Classifying critical points', 'Integration', 'Limits'], ans: 1, level: 'intermediate' },
    { q: 'What does a definite integral geometrically represent?', opts: ['Slope of tangent', 'Area under curve', 'Rate of change', 'Inflection point'], ans: 1, level: 'basic' },
    { q: 'Gradient of a scalar function points in the direction of ___?', opts: ['Minimum change', 'Maximum increase', 'Zero change', 'Saddle point'], ans: 1, level: 'intermediate' },
    { q: 'What is the Taylor series expansion used for?', opts: ['Solving equations', 'Approximating functions near a point', 'Finding derivatives', 'Computing integrals'], ans: 1, level: 'advanced' },
  ],

  'Database Systems': [
    { q: 'In SQL, which clause filters rows after grouping?', opts: ['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY'], ans: 1, level: 'basic' },
    { q: 'What does ACID stand for in databases?', opts: ['Atomicity, Consistency, Isolation, Durability', 'Access, Control, Index, Data', 'Async, Commit, Integrity, Distribution', 'Allocation, Concurrency, Index, Deadlock'], ans: 0, level: 'intermediate' },
    { q: 'A foreign key enforces ___?', opts: ['Unique values', 'Referential integrity', 'Not-null constraints', 'Primary key'], ans: 1, level: 'basic' },
    { q: 'Which normal form eliminates transitive dependencies?', opts: ['1NF', '2NF', '3NF', 'BCNF'], ans: 2, level: 'intermediate' },
    { q: 'What is an index in a database?', opts: ['A backup copy', 'A data structure to speed up queries', 'A view', 'A stored procedure'], ans: 1, level: 'basic' },
    { q: 'What is the purpose of a transaction log?', opts: ['Store queries', 'Enable recovery and undo', 'Cache results', 'Compress data'], ans: 1, level: 'intermediate' },
    { q: 'Which JOIN returns all rows from both tables?', opts: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'], ans: 3, level: 'intermediate' },
    { q: 'What problem does a deadlock represent in databases?', opts: ['Data corruption', 'Two transactions waiting on each other', 'Slow queries', 'Index fragmentation'], ans: 1, level: 'advanced' },
  ],

  'Operating Systems': [
    { q: 'What is a process in OS terminology?', opts: ['A stored program', 'A program in execution', 'An OS file', 'A system call'], ans: 1, level: 'basic' },
    { q: 'What scheduling algorithm is fairest in terms of response time?', opts: ['FCFS', 'SJF', 'Round Robin', 'Priority'], ans: 2, level: 'intermediate' },
    { q: 'What is virtual memory?', opts: ['Extra RAM', 'Using disk as RAM extension', 'GPU memory', 'Cache memory'], ans: 1, level: 'basic' },
    { q: 'A semaphore is used to ___?', opts: ['Allocate memory', 'Control access to shared resources', 'Schedule processes', 'Handle interrupts'], ans: 1, level: 'intermediate' },
    { q: 'What is thrashing in OS?', opts: ['High CPU usage', 'Excessive paging reducing performance', 'Deadlock state', 'Memory leak'], ans: 1, level: 'advanced' },
    { q: 'Which OS concept prevents two processes from running simultaneously on a critical section?', opts: ['Paging', 'Mutex', 'Fragmentation', 'Preemption'], ans: 1, level: 'intermediate' },
    { q: 'What does DMA stand for?', opts: ['Dynamic Memory Allocation', 'Direct Memory Access', 'Disk Management Architecture', 'Data Management API'], ans: 1, level: 'basic' },
    { q: "Belady's anomaly occurs in which page replacement algorithm?", opts: ['LRU', 'Optimal', 'FIFO', 'Clock'], ans: 2, level: 'advanced' },
  ],

  'Computer Networks': [
    { q: 'Which layer of OSI handles routing?', opts: ['Data Link', 'Network', 'Transport', 'Session'], ans: 1, level: 'basic' },
    { q: 'What does TCP ensure that UDP does not?', opts: ['Speed', 'Reliable delivery', 'Low latency', 'Broadcasting'], ans: 1, level: 'basic' },
    { q: 'What is the purpose of the DNS?', opts: ['Encrypt data', 'Translate domain names to IPs', 'Route packets', 'Assign IPs'], ans: 1, level: 'basic' },
    { q: 'Which protocol is used for secure web browsing?', opts: ['HTTP', 'FTP', 'HTTPS', 'SMTP'], ans: 2, level: 'basic' },
    { q: 'What is subnetting used for?', opts: ['Encrypting packets', 'Dividing IP networks into smaller ones', 'Speed up routing', 'Connect WANs'], ans: 1, level: 'intermediate' },
    { q: 'What does ARP do?', opts: ['Map IP to MAC address', 'Route packets', 'Encrypt data', 'Assign domain names'], ans: 0, level: 'intermediate' },
    { q: 'What is the 3-way handshake in TCP?', opts: ['SYN, SYN-ACK, ACK', 'ACK, SYN, FIN', 'SYN, ACK, FIN', 'REQ, RES, ACK'], ans: 0, level: 'intermediate' },
    { q: 'What is BGP used for?', opts: ['Local network routing', 'Inter-domain routing on the internet', 'IP assignment', 'DNS resolution'], ans: 1, level: 'advanced' },
  ],

  'Python': [
    { q: 'What is the output of: type([]) in Python?', opts: ["<class 'list'>", "<class 'tuple'>", "<class 'set'>", "<class 'array'>"], ans: 0, level: 'basic' },
    { q: 'Which keyword is used for generators in Python?', opts: ['return', 'yield', 'async', 'generate'], ans: 1, level: 'intermediate' },
    { q: 'What does @property decorator do in Python?', opts: ['Makes method static', 'Wraps a method as a getter', 'Creates a class', 'Overrides a method'], ans: 1, level: 'intermediate' },
    { q: 'What is a list comprehension?', opts: ['Looping a list', 'Concise way to create lists', 'Sorting a list', 'Filtering with lambda'], ans: 1, level: 'basic' },
    { q: "What is Python's GIL?", opts: ['Global Integer Lock', 'Global Interpreter Lock', 'General Input Limit', 'Generator Inner Loop'], ans: 1, level: 'advanced' },
    { q: 'What does "pass" do in Python?', opts: ['End function', 'Do nothing (placeholder)', 'Skip to next iteration', 'Return None'], ans: 1, level: 'basic' },
    { q: 'What is the difference between is and == in Python?', opts: ['No difference', 'is checks identity, == checks equality', '== checks identity, is checks equality', 'is is faster'], ans: 1, level: 'intermediate' },
    { q: 'What is a decorator in Python?', opts: ['A class attribute', 'A function wrapper', 'A loop pattern', 'A module'], ans: 1, level: 'intermediate' },
  ],

  'Java': [
    { q: 'Which keyword makes a variable constant in Java?', opts: ['const', 'static', 'final', 'immutable'], ans: 2, level: 'basic' },
    { q: 'What is the output of: 5 / 2 in Java (integer division)?', opts: ['2.5', '2', '3', '2.0'], ans: 1, level: 'basic' },
    { q: 'What is polymorphism in Java?', opts: ['Multiple inheritance', 'One interface, many implementations', 'Static binding', 'Encapsulation'], ans: 1, level: 'intermediate' },
    { q: 'What does the "super" keyword do in Java?', opts: ['Creates an object', 'Refers to parent class', 'Defines interface', 'Makes method static'], ans: 1, level: 'basic' },
    { q: 'Which collection maintains insertion order in Java?', opts: ['HashSet', 'TreeSet', 'LinkedList', 'HashMap'], ans: 2, level: 'intermediate' },
    { q: 'What is the purpose of `synchronized` in Java?', opts: ['Speed up code', 'Prevent concurrent thread access', 'Enable generics', 'Handle exceptions'], ans: 1, level: 'advanced' },
    { q: 'What is autoboxing in Java?', opts: ['Automatic memory management', 'Auto-conversion between primitives and wrappers', 'Constructor generation', 'Import system'], ans: 1, level: 'intermediate' },
    { q: 'What is a functional interface in Java 8?', opts: ['Interface with multiple methods', 'Interface with exactly one abstract method', 'Abstract class', 'Generic interface'], ans: 1, level: 'advanced' },
  ],

  'Statistics': [
    { q: 'What does the standard deviation measure?', opts: ['Central value', 'Spread of data around mean', 'Range of data', 'Most frequent value'], ans: 1, level: 'basic' },
    { q: 'What is the p-value in hypothesis testing?', opts: ['Probability of data given null hypothesis', 'Sample size', 'Effect size', 'Confidence interval'], ans: 0, level: 'intermediate' },
    { q: 'What does a correlation coefficient of -1 mean?', opts: ['No correlation', 'Perfect positive correlation', 'Perfect negative correlation', 'Moderate correlation'], ans: 2, level: 'basic' },
    { q: 'Which distribution is symmetric and bell-shaped?', opts: ['Poisson', 'Binomial', 'Normal', 'Exponential'], ans: 2, level: 'basic' },
    { q: 'What is the Central Limit Theorem?', opts: ['Samples are always normal', 'Sample means approach normal distribution as n grows', 'Population must be normal', 'Variance equals standard deviation'], ans: 1, level: 'intermediate' },
    { q: 'What is Type I error?', opts: ['False negative', 'False positive (rejecting true null)', 'Correct rejection', 'Power error'], ans: 1, level: 'intermediate' },
    { q: 'What is Bayes Theorem used for?', opts: ['Calculating variance', 'Updating probability with new evidence', 'Regression analysis', 'Sampling techniques'], ans: 1, level: 'intermediate' },
    { q: 'In linear regression, R² measures ___?', opts: ['Slope', 'Correlation', 'Variance explained by model', 'Residual error'], ans: 2, level: 'advanced' },
  ],
};

/**
 * Generate quiz questions for a user.
 * For each subject, pick 5 questions randomly (mix of levels).
 */
const generateQuiz = (subjectsNeeded = [], subjectsStrong = []) => {
  const allSubjects = [...new Set([...subjectsNeeded, ...subjectsStrong])];
  const quiz = [];

  for (const subject of allSubjects) {
    const pool = QUESTION_BANK[subject];
    if (!pool) continue;

    // Shuffle and take 5
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 5);
    shuffled.forEach((q, i) => {
      quiz.push({
        id:      `${subject.replace(/\s+/g, '_')}_${i}`,
        subject,
        question: q.q,
        options:  q.opts,
        correct:  q.ans,
        level:    q.level,
        type:     subjectsNeeded.includes(subject) ? 'weak' : 'strong',
      });
    });
  }

  return quiz;
};

/**
 * Score quiz results per subject.
 * Returns: { [subject]: { score: 0-1, correct, total, level, type } }
 */
const scoreQuiz = (questions, answers) => {
  const bySubject = {};

  questions.forEach((q, idx) => {
    if (!bySubject[q.subject]) {
      bySubject[q.subject] = { correct: 0, total: 0, type: q.type };
    }
    bySubject[q.subject].total++;
    if (answers[idx] === q.correct) bySubject[q.subject].correct++;
  });

  const results = {};
  for (const [subject, data] of Object.entries(bySubject)) {
    const score = data.correct / data.total;
    let level;
    if      (score >= 0.85) level = 'Expert';
    else if (score >= 0.65) level = 'Advanced';
    else if (score >= 0.40) level = 'Intermediate';
    else                    level = 'Beginner';

    results[subject] = {
      score:   Math.round(score * 100),
      correct: data.correct,
      total:   data.total,
      level,
      type:    data.type,
    };
  }

  return results;
};

module.exports = { generateQuiz, scoreQuiz, QUESTION_BANK };
