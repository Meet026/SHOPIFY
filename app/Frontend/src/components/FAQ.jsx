import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Page, Layout, Card, Text, DataTable, Button, Modal, TextField, Select } from "@shopify/polaris";

const FAQ = () => {
  const [searchParams] = useSearchParams();
  const categoryName = searchParams.get("category"); // Get category from URL
  
  const [faqs, setFaqs] = useState([]);
  const [modalActive, setModalActive] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: "", answerType: "text", answer: "", rating: "5" });
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // Search query state

  useEffect(() => {
    if (categoryName) {
      // Simulating fetching FAQs from API
      const dummyFAQs = {
        "Home Appliances": [
          { question: "How to clean a washing machine?", answerType: "text", answer: "Use vinegar and baking soda.", rating: "4" },
          { question: "Best way to maintain a refrigerator?", answerType: "text", answer: "Clean coils regularly.", rating: "5" },
        ],
        Electronics: [
          { question: "How to extend battery life?", answerType: "text", answer: "Avoid overcharging your phone.", rating: "3" },
        ],
      };

      setFaqs(dummyFAQs[categoryName] || []);
    }
  }, [categoryName]);

  const toggleModal = useCallback(() => {
    if (modalActive) {
      setNewFaq({ question: "", answerType: "text", answer: "", rating: "5" });
      setIsEditing(false);
      setEditingIndex(null);
    }
    setModalActive(!modalActive);
  }, [modalActive]);

  const handleInputChange = (field) => (value) => {
    setNewFaq({ ...newFaq, [field]: value });
  };

  const handleSaveFaq = () => {
    if (isEditing) {
      const updatedFaqs = [...faqs];
      updatedFaqs[editingIndex] = newFaq;
      setFaqs(updatedFaqs);
    } else {
      setFaqs([...faqs, newFaq]);
    }

    toggleModal();
  };

  const handleEditFaq = (index) => {
    setNewFaq(faqs[index]);
    setIsEditing(true);
    setEditingIndex(index);
    toggleModal();
  };

  const handleDeleteFaq = (index) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  // Filter FAQs based on the search query
  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to display star ratings
  const renderStars = (rating) => {
    const starCount = parseInt(rating, 10) || 0;
    return "★".repeat(starCount) + "☆".repeat(5 - starCount);
  };

  const rows = filteredFaqs.map((faq, index) => [
    faq.question,
    faq.answerType === "text" ? faq.answer : <Text as="span">{faq.answerType.toUpperCase()}</Text>,
    renderStars(faq.rating), // Display star ratings
    <div style={{ display: "flex", gap: "8px" }}>
      <Button onClick={() => handleEditFaq(index)} size="slim">Edit</Button>
      <Button destructive onClick={() => handleDeleteFaq(index)} size="slim">Delete</Button>
    </div>
  ]);

  return (
    <Page title={`FAQs for ${categoryName || "Category"}`}>
      <Layout>
        {/* Category Header */}
        <Layout.Section>
          <Card sectioned>
            <Text as="h2" variant="headingLg">Category: {categoryName || "N/A"}</Text>
          </Card>
        </Layout.Section>

        {/* FAQ Table */}
        <Layout.Section>
          <Card sectioned>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                flexDirection: "row",
                gap: "10px",
                marginBottom: "10px",
                justifyContent: "flex-end",
              }}
            >
              <label
                htmlFor="searchField"
                style={{
                  marginBottom: "8px",
                  fontWeight: "bold",
                  fontSize: "16px",
                }}
              >
                Search:
              </label>
              <TextField
                id="searchField"
                value={searchQuery}
                onChange={(value) => setSearchQuery(value)}
                placeholder="Search Category"
                autoComplete="off"
                style={{ width: "400px" }}
              />
            </div>
            <DataTable
              columnContentTypes={["text", "text", "text", "text"]}
              headings={["Question", "Answer Type", "Rating", "Actions"]}
              rows={rows}
            />
          </Card>
        </Layout.Section>

        {/* Add FAQ Button */}
        <Layout.Section>
          <Button primary onClick={toggleModal}>Add FAQ</Button>
        </Layout.Section>

        {/* Add/Edit FAQ Modal */}
        <Modal
          open={modalActive}
          onClose={toggleModal}
          title={isEditing ? "Edit FAQ" : "Add FAQ"}
          primaryAction={{
            content: isEditing ? "Save Changes" : "Add FAQ",
            onAction: handleSaveFaq,
          }}
          secondaryActions={[{ content: "Cancel", onAction: toggleModal }]}
        >
          <Modal.Section>
            <TextField
              label="Question"
              value={newFaq.question}
              onChange={handleInputChange("question")}
              autoComplete="off"
              placeholder="Enter question"
            />

            <Select
              label="Answer Type"
              options={[
                { label: "Text", value: "text" },
                { label: "Image", value: "image" },
                { label: "Video", value: "video" },
              ]}
              onChange={handleInputChange("answerType")}
              value={newFaq.answerType}
            />

            {newFaq.answerType === "text" && (
              <TextField
                label="Answer"
                value={newFaq.answer}
                onChange={handleInputChange("answer")}
                autoComplete="off"
                multiline
                placeholder="Enter answer"
              />
            )}

            {(newFaq.answerType === "image" || newFaq.answerType === "video") && (
              <TextField
                type="file"
                label={`Upload ${newFaq.answerType}`}
                onChange={handleInputChange("answer")}
                accept={newFaq.answerType === "image" ? "image/*" : "video/*"}
              />
            )}

            {/* Rating Select Dropdown */}
            <Select
              label="Rating"
              options={[
                { label: "1 Star", value: "1" },
                { label: "2 Stars", value: "2" },
                { label: "3 Stars", value: "3" },
                { label: "4 Stars", value: "4" },
                { label: "5 Stars", value: "5" },
              ]}
              onChange={handleInputChange("rating")}
              value={newFaq.rating}
            />
          </Modal.Section>
        </Modal>
      </Layout>
    </Page>
  );
};




export default FAQ;