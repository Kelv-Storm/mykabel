const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !auth.currentUser) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const userDocRef = doc(db, "smes", auth.currentUser.uid);
      
      // FIXED: Use setDoc with merge instead of updateDoc to prevent crashes on new accounts
      await setDoc(userDocRef, {
        chatHistory: arrayUnion(userMessage)
      }, { merge: true });

      // HACKATHON CHEAT CODE: Force the AI to remember the user by secretly injecting 
      // a system prompt into the history array before sending it to the backend.
      const enrichedHistory = [
        { 
          role: 'system', 
          content: `CRITICAL CONTEXT: You are advising a startup named "${startupName}" in the "${industry}" industry. They have a match score logic running. Always tailor your advice specifically to their industry and scale.` 
        },
        ...messages, 
        userMessage
      ];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage.content,
          history: enrichedHistory, // Sends the injected memory!
          profile: smeProfile 
        }),
      });

      if (!response.ok) throw new Error("Neural generation channel dropped");
      const data = await response.json();
      const assistantMessage = { role: 'assistant', content: data.reply };

      setMessages(prev => [...prev, assistantMessage]);

      // Save Assistant Message safely
      await setDoc(userDocRef, {
        chatHistory: arrayUnion(assistantMessage)
      }, { merge: true });

    } catch (err) {
      console.error("Chat sync crash:", err);
      setMessages(prev => [...prev, { role: 'assistant', content: "System connection latency detected. Please retry transmission." }]);
    } finally {
      setLoading(false);
    }
  };
