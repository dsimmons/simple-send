var SimpleSend = {
    start: function() {
        this.app = new this.MessageView();
        return this.app;
    }
}

SimpleSend.Message = Backbone.Model.extend({

    url: function() { return "https://mandrillapp.com/api/1.0/messages/send.json"; },

    defaults: {
        key: "",
        message: {
            text: "",
            subject: "",
            from_email: "",
            to: [{
                email: ""
            }],
            track_opens: true,
            track_clicks: true,
        }
    }

});

SimpleSend.PDFAttachment = Backbone.Model.extend({

    download: function(url) {
        var deferred = $.Deferred();
        var _this = this;
        PDFJS.disableWorker = true;
        PDFJS.getDocument(url).then(function(pdf) {
            var data = pdf.getData()._data;
            var base64 = ''
            for (var i = 0; i < data.byteLength; i++) {
                base64 += String.fromCharCode(data[i]);
            }
            _this.set([{
                content: btoa(base64),
                name: url,
                type: 'application/pdf'
            }]);
            deferred.resolve();
        });
        return deferred.promise();
    }
});

SimpleSend.MessageView = Backbone.View.extend({

    el: $('#emailForm'),

    initialize: function() {
        this.model = new SimpleSend.Message();
    },

    events: {
        'click #clearEmail': function() {
            this.$('input').each( function() { $(this).val(''); });
            this.$('textarea').each( function() { $(this).val(''); });
        },

        'click #sendEmail': function(click) {
            var btn = $(click.currentTarget).button('loading');
            var _this = this;

            successCallback = function(data, statusText, jqXHR) {
                btn.removeClass('btn-primary btn-danger').addClass('btn-success');
                console.log('success', data, statusText, jqXHR);
                doneCallback()
            };

            failCallback = function(data, statusText, jqXHR) {
                btn.removeClass('btn-primary btn-success').addClass('btn-danger');
                console.log('failure', data, statusText, jqXHR);
                doneCallback();
            };

            doneCallback = function() {
                setTimeout(function() {
                    btn.button('reset').removeClass('btn-danger btn-success').addClass('btn-primary');
                }, 3000);
            }

            $.when(this.serialize()).pipe( function() {
                _this.model.save().then(successCallback, failCallback)
            });
        }
    },

    serialize: function() {
        var vals = {
            key: this.$('#apiKey').val(),
            message: {
                text: this.$('#emailContents').val(),
                subject: this.$('#emailSubject').val(),
                from_email: this.$('#emailFrom').val(),
                to: [
                    { email: this.$('#emailTo').val() }
                ],
            }
        };

        var attachmentURL = this.$('#emailAttachment').val();
        var promise;
        if (attachmentURL) {
            var attachment = vals.message.attachments = new SimpleSend.PDFAttachment();
            promise = attachment.download(attachmentURL);
        }

        this.model.set(vals);
        return promise;
    }
});

$(function() {
    SimpleSend.start();
    var app = SimpleSend.app;
});
