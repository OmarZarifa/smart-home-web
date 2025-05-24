import React, { useState } from 'react';
import '../components/styles.css';

const HelpCenterDashboard = () => {
    const [open, setOpen] = useState(null);

    const toggleQuestion = (index) => {
        setOpen(open === index ? null : index);
    };

    //TODO keep this data in database instead
    const faqs = [
        {
            question: "How do I add a device?",
            answer: "To add a device, go to the dashboard page, click 'Add Device', and click on the desired device that you want to add."
        },
        {
            question: "How do I delete a device?",
            answer: "To delete a device, go to the dashboard page, click on the bin icon on the desired device."
        },
        {
            question: "How do I reset my password?",
            answer: "To reset your password, go to the profile settings and update your password."
        },
        {
            question: "How do I update my email address or username?",
            answer: "To update your email address or username, go to your profile settings, enter your new email in the 'Email' field and new username in the 'Username' field, and update."
        },
        {
            question: "What do I do if I encounter an error?",
            answer: "If you encounter an error, please take a screenshot and send it to support. You can also try refreshing the page or clearing your browser cache."
        },
        {
            question: "Where can I find security logs?",
            answer: "Security logs can be found in the Logs."
        },
        {
            question: "How can I update a device?",
            answer: "To update a device, go to your dashbord, click on the settings icon on the desired device and update, you can also update the devices using the 'Voice Control' view."
        }
    ];

    return (
        <div className="container-help-center">
            <div className="faq-container">
                {faqs.map((faq, index) => (
                    <div key={index} className="faq-item">
                        <div
                            className="question"
                            onClick={() => toggleQuestion(index)}
                        >
                            {faq.question}
                        </div>
                        {open === index && (
                            <div className="answer">
                                {faq.answer}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HelpCenterDashboard;
